import React from "react";
import "./FileExplorer.css";
import { Component } from "react";
import enter_icon from "../img/enter.svg";
import return_icon from "../img/return.svg";
import { GetChildrenElements, UploadFile } from "../http-requests/http-requests";
import Swal from "sweetalert2";
import { ContextMenu } from "../context-menu/context-menu";

export class FileExplorer extends Component {
  constructor(props) {
    super(props);
    this.connection = props.connection;
    this.state = {
      items: [],
      show_drop: false,
    };
    this.path = "/";
    this.selected_row = null;
    this.selected_row_type = null;
    this.context_menu_ref = React.createRef();
    this.current_element_ref = React.createRef();
    if (props.connection.path) {
      this.path = props.connection.path;
    }
    this.size_sort_ascending = false;
    this.name_sort_ascending = false;
    this.last_modified_sort_ascending = false;
  }

  componentDidMount() {
    this.updateChildrenElements();
  }

  updateChildrenElements() {
    if (this.connection) {
      (async () => {
        this.path = this.path === "" ? "/" : this.path;
        this.path = this.path[0] === "/" ? this.path : "/" + this.path;
        let response = await GetChildrenElements(this.connection.id, this.path);
        if (!response.error) {
          let children = [];
          for (let i = 0; i < response.data.children.length; i++) {
            let child = response.data.children[i];
            children.push({
              icon: child.icon,
              name: child.name,
              type: child.type,
              last_modified: child.last_modified,
              size: child.size,
              real_size: child.real_size,
              permissions:
                (child.permissions.read ? "r" : "") +
                (child.permissions.write ? "w" : "") +
                (child.permissions.execute ? "x" : ""),
            });
          }
          this.setState({ items: children });
        } else {
          // undo path changes
          this.path =
            this.path[this.path.length - 1] !== "/"
              ? this.path
              : this.path.substring(0, this.path.length - 1);
          this.path = this.path.substring(0, this.path.lastIndexOf("/"));

          // display error
          if (response.statusCode === 401) {
            Swal.fire({
              title: "Error!",
              text: "You don't have enough permissions to open this resource",
              timer: 5000,
              icon: "error",
              confirmButtonText: "Ok",
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: response.statusCode,
              timer: 2000,
              icon: "error",
              confirmButtonText: "Ok",
            });
          }
        }
      })();
    } else {
      alert("Error");
    }
  }

  render() {
    let rows = [];
    for (let i = 0; i < this.state.items.length; i++) {
      let row = this.state.items[i];

      rows.push(
        <div
          key={"row" + i}
          className="row"
          onMouseEnter={() => { this.rowMouseEnter(row) }}
          onMouseLeave={() => { this.rowMouseLeave(row) }}
          onClick={(event) => this.rowClick(event, row)}
        >
          <span className="cell file-icon">
            <img src={row.icon} alt="File icon" className="file-icon" />
          </span>
          <span className="cell file-name">{row.name}</span>
          <span className="cell file-type">{row.type}</span>
          <span className="cell file-last-modified">
            {new Date(row.last_modified).toLocaleDateString() + " " + new Date(row.last_modified).toLocaleTimeString()}
          </span>
          <span className="cell file-size">{row.size}</span>
          <span className="cell file-permissions">{row.permissions}</span>
        </div>
      )
    }


    return (
      <div className="file-explorer" ref={this.current_element_ref}>
        <ContextMenu ref={this.context_menu_ref} />
        <div className="header">
          <div className="buttons">
            <button>
              <img
                src={return_icon}
                alt="Return"
                onClick={() => this.returnToParent()}
              />
            </button>
          </div>
        </div>
        <div
          onContextMenu={(event) => this.showContextMenu(event)}
          onDragOver={(e) => {
            // console.log("drag enter")
            e.preventDefault();
            this.setState({ show_drop: true });
          }}
          onDragLeave={(e) => {
            // console.log("drag leave")
            e.preventDefault();
            this.setState({ show_drop: false });
          }}
          onDrop={(e) => {
            e.preventDefault();
            this.uploadFiles(e.dataTransfer.files);
            this.setState({ show_drop: false });
          }}
        >
          {
            // this.state.show_drop ?
            //   <div className="dropzone">
            //     <p>Drop the file to upload here</p>
            //   </div>
            //   :
            //   null
          }
          <div>
            <div className="row header">
              <span className="cell file-icon"></span>
              <span className="cell sortable file-name" onClick={() => { this.orderBy("name") }}>Name</span>
              <span className="cell file-type">Type</span>
              <span className="cell sortable file-last-modified" onClick={() => { this.orderBy("last_modified") }}>Last Modified</span>
              <span className="cell sortable file-size" onClick={() => { this.orderBy("size") }}>Size</span>
              <span className="cell file-permissions">Permissions</span>
            </div>
            <div className={this.state.show_drop ? "rows scroll-disabled" : "rows "}>
              {rows}
            </div>
          </div>
        </div>
      </div>
    );
  }

  orderBy(field) {
    function _compare_by_name(a, b) {
      return a.name.localeCompare(b.name);
    }

    function _compare_by_size(a, b) {
      return a.real_size - b.real_size;
    }

    function _compare_by_last_modified(a, b) {
      return Date.parse(a.last_modified) - Date.parse(b.last_modified);
    }

    let sorted_items = this.state.items;
    if (field === 'name') {
      sorted_items.sort(_compare_by_name);
      this.name_sort_ascending = !this.name_sort_ascending;
      if (!this.name_sort_ascending) {
        sorted_items.reverse();
      }
    }
    else if (field === 'size') {
      sorted_items.sort(_compare_by_size);
      this.size_sort_ascending = !this.size_sort_ascending;
      if (!this.size_sort_ascending) {
        sorted_items.reverse();
      }
    }
    else if (field === 'last_modified') {
      sorted_items.sort(_compare_by_last_modified);
      this.last_modified_sort_ascending = !this.last_modified_sort_ascending;
      if (!this.last_modified_sort_ascending) {
        sorted_items.reverse();
      }
    }

    this.setState({ items: sorted_items });
  }

  rowMouseEnter(row) {
    this.selected_row =
      (this.path[this.path.length - 1] === "/" ? this.path : this.path + "/") +
      row.name;
    this.selected_row_type = row.type;
  }

  rowMouseLeave(row) {
    this.selected_row = null;
    this.selected_row_type = null;
  }

  rowClick(event, row) {
    let click_count = event.detail;
    if (click_count === 2) {
      this.openChild(row)
    }
  }

  openChild(row) {
    if (row.type === "dir") {
      // it's a directory
      this.path =
        this.path +
        (this.path[this.path.length - 1] === "/" ? "" : "/") +
        row.name;
      this.updateChildrenElements();
    } else {
      // it's a file
    }
  }

  returnToParent() {
    if (this.path !== "/" || this.path !== "") {
      this.path =
        this.path[this.path.length - 1] === "/"
          ? this.path.substring(0, this.path.length - 1)
          : this.path;
      let position = this.path.lastIndexOf("/");
      this.path = this.path.substring(0, position);
      this.updateChildrenElements();
    }
  }

  showContextMenu(event) {
    event.preventDefault();
    if (this.selected_row) {
      let element_bounding_client_rect = this.current_element_ref.current.getBoundingClientRect();

      let left = event.pageX - element_bounding_client_rect.left;
      let top = event.pageY - element_bounding_client_rect.top;

      if (left < 25) {
        left = 25;
      }
      if (top < 25) {
        top = 25;
      }

      if (left > element_bounding_client_rect.width - 175) {
        left = element_bounding_client_rect.width - 175;
      }
      this.context_menu_ref.current.displayContextMenu(left, top, this.selected_row, this.selected_row_type);
    }
  }

  uploadFiles(files) {

    for (let i = 0; i < files.length; i++) {
      let path = this.path[this.path.length - 1] == "/" ? this.path : this.path + "/";
      path += files[i].name;
      UploadFile(path, files[i])
    }
  }

}
