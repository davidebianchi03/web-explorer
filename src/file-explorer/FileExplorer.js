import React from "react";
import "./FileExplorer.css";
import { Component } from "react";
import return_icon from "../img/return.svg";
import { DeletePath, DownloadPath, GetChildrenElements, RenamePath, UploadFile } from "../http-requests/http-requests";
import Swal from "sweetalert2";
import { ContextMenu } from "../context-menu/context-menu";
import open_icon from "../img/open.png";
import download_icon from "../img/download.png";
import menu_icon from "../img/menu.png";
import rename_icon from "../img/rename.png";
import create_file_icon from "../img/create_file.png";
import create_folder_icon from "../img/create_folder.png";
import trash_icon from "../img/trash.png";
import WinBox from 'react-winbox';
import FileEditor from "../file-editor/file-editor";

export class FileExplorer extends Component {
  constructor(props) {
    super(props);
    this.connection = props.connection;
    this.state = {
      items: [],
      show_drop: false,
      selected_items: [],
    };
    this.path = "/";
    this.context_menu_ref = React.createRef();
    this.current_element_ref = React.createRef();
    if (props.connection.path) {
      this.path = props.connection.path;
    }
    this.size_sort_ascending = false;
    this.name_sort_ascending = false;
    this.last_modified_sort_ascending = false;
    this.addWindow = props.handleAddWindow;
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
      let selected = this.state.selected_items.includes(row);

      rows.push(
        <div
          key={"row" + i}
          className={selected ? "row selected" : "row"}
          onClick={(event) => this.rowClick(event, row)}
          onContextMenu={(event) => this.showContextMenu(event, row)}
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
      <div className="file-explorer" ref={this.current_element_ref}
        onDragOver={(e) => {
          e.preventDefault();
          this.setState({ show_drop: true });
        }}>
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
        <div>
          {
            this.state.show_drop ?
              <div className="dropzone"
                onDragLeave={(e) => {
                  e.preventDefault();
                  this.setState({ show_drop: false });
                }}
                onDrop={async (e) => {
                  e.preventDefault();
                  this.uploadFiles(e.dataTransfer.files);
                  this.setState({ show_drop: false });
                }}>
                <p>Drop the file to upload here</p>
              </div>
              :
              null
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

  rowClick(event, row) {
    let click_count = event.detail;
    let button = event.button;
    let ctrl_key_pressed = event.ctrlKey;

    if (click_count === 1 && button === 0) {
      if (ctrl_key_pressed) {
        let selected_rows = this.state.selected_items;
        selected_rows.push(row);
        this.setState({
          selected_items: selected_rows
        });
      } else {
        let just_selected = this.state.selected_items.includes(row);
        if (just_selected) {
          this.setState({
            selected_items: []
          });
        } else {
          this.setState({
            selected_items: [row]
          });
        }
      }
    }
    else if (click_count === 2) {
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
    }
    else if (row.type === "txt-file") {
      let file_editor = (
        <WinBox
          width={700}
          height={300}
          x="center"
          y={100}
          title={row.name}
          bottom={0}
          className='modern front'
          background="#0077ff"
          noFull={true}
        >
          <FileEditor filepath={this.path +
            (this.path[this.path.length - 1] === "/" ? "" : "/") +
            row.name} />
        </WinBox>
      );
      this.addWindow(file_editor);
    }
    else {
      // it's bin a file
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

  showContextMenu(event, row) {
    event.preventDefault();
    let ctrl_key_pressed = event.ctrlKey;

    if (!this.state.selected_items.includes(row) && ctrl_key_pressed) {
      let items = this.state.selected_items;
      items.push(row);
      this.setState({
        selected_items: items
      });
    } else {
      this.setState({
        selected_items: [row]
      });
    }

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
    let options = [
      {
        title: "Download",
        icon: download_icon,
        action: this.downloadItems
      },
      {
        title: "Delete",
        icon: trash_icon,
        action: this.deleteItems
      },
    ]

    if (this.state.selected_items.length === 1) {
      options = [{
        title: "Open",
        icon: open_icon,
        action: () => { this.openChild(this.state.selected_items[0]) }
      },]
        .concat([
          {
            title: "Rename",
            icon: rename_icon,
            action: () => { this.renameItem(this.state.selected_items[0]) }
          },
        ])
        .concat(options)
        .concat([
          {
            title: "Properties",
            icon: menu_icon,
            action: () => { alert("Hello") }
          },
        ])
        .concat([
          {
            title: "Create file",
            icon: create_file_icon,
            action: () => { alert("Hello") }
          },
        ])
        .concat([
          {
            title: "Create folder",
            icon: create_folder_icon,
            action: () => { alert("Hello") }
          },
        ]);
    }

    this.context_menu_ref.current.display(left, top, options);

  }

  downloadItems = async () => {
    Swal.fire("Downloading files", "It may take a lot of time...", 'info');
    for (let i = 0; i < this.state.selected_items.length; i++) {
      let row = this.state.selected_items[i];
      let row_path = this.path[this.path.length - 1] === "/" ? (this.path + row.name) : (this.path + "/" + row.name);

      let result = await DownloadPath(row_path, row.name);
      if (result.error) {
        await Swal.fire(result.statusCode.toString(), result.error, 'error');
      }
    }
    Swal.close();
  }

  deleteItems = async () => {
    let message = "";
    if (this.state.selected_items.length > 1) {
      message = `You will not be able to recover selected items`;
    } else {
      message = `You will not be able to recover element at ${this.path + this.state.selected_items[0].name}`;
    }

    let result = await Swal.fire({
      title: "Are you sure?",
      text: message,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: '#DD6B55',
      confirmButtonText: 'Yes',
      cancelButtonText: "No",
    });

    if (result.isConfirmed) {
      for (let i = 0; i < this.state.selected_items.length; i++) {
        let row = this.state.selected_items[i];
        let row_path = this.path[this.path.length - 1] === "/" ? (this.path + row.name) : (this.path + "/" + row.name);

        let result = await DeletePath(row_path);
        if (result.error) {
          await Swal.fire(result.statusCode, result.error, 'error');
        }
      }
    }

    this.updateChildrenElements();
  }

  async uploadFiles(files) {

    for (let i = 0; i < files.length; i++) {
      let path = this.path[this.path.length - 1] === "/" ? this.path : this.path + "/";
      path += files[i].name;

      let response = await UploadFile(path, files[i]);
      if (response.error) {
        Swal.fire(
          "Cannot upload file",
          response.data.response.data.message ? response.data.response.data.message : response.data.message,
          "error"
        );
      }
    }

    this.updateChildrenElements();
  }

  renameItem = async (row) => {
    let path = this.path[this.path.length - 1] === "/" ? this.path : this.path + "/";
    path += row.name;
    let result = await Swal.fire({
      title: `Rename ${path}`,
      text: "Enter the new name",
      input: 'text',
      inputValue: row.name,
      inputPlaceholder: "Filename",
      showCancelButton: true
    });

    if (result.isConfirmed) {
      let new_filename = result.value;

      let response = await RenamePath(path, new_filename);
      if (response.error) {
        Swal.fire(
          "Cannot rename path",
          response.data.response.data.message ? response.data.response.data.message : response.data.message,
          "error"
        );
      }
      this.updateChildrenElements();
    }
  }
}
