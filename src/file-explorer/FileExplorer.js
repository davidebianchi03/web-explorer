import React from "react";
import "./FileExplorer.css";
import { Component } from "react";
import enter_icon from "../img/enter.svg";
import return_icon from "../img/return.svg";
import DataTable from "react-data-table-component";
import { GetChildrenElements } from "../http-requests/http-requests";
import Swal from "sweetalert2";
import { ContextMenu } from "../context-menu/context-menu";

export class FileExplorer extends Component {
  constructor(props) {
    super(props);
    this.connection = props.connection;
    this.state = {
      items: [],
    };
    this.path = "/";
    this.selected_row = null;
    this.context_menu_ref = React.createRef();
    this.current_element_ref = React.createRef();
    if(props.connection.path){
      this.path = props.connection.path;
    }
  }

  componentDidMount() {
    this.updateChildrenElements();
  }

  updateChildrenElements() {
    if (this.connection) {
      (async () => {
        this.path = this.path === "" ? "/" : this.path;
        this.path = this.path[0] === "/" ? this.path : "/" + this.path;
        console.log(this.path)
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
    let columns = [
      {
        name: "",
        selector: (row) => row.icon,
        width: "25px",
        style: {
          height: 25,
        },
        cell: (row) => (
          <img src={row.icon} alt="File icon" className="file-icon" />
        ),
      },
      {
        name: "Name",
        selector: (row) => row.name,
        sortable: true,
        style: {
          fontWeight: 500,
        },
      },
      {
        name: "Type",
        selector: (row) => row.type,
        sortable: true,
      },
      {
        name: "Last Modified",
        selector: (row) => row.last_modified,
        sortable: true,
      },
      {
        name: "Size",
        selector: (row) => row.size,
      },
      {
        name: "Permissions",
        selector: (row) => row.permissions,
      },
    ];

    const CustomStyle = {
      rows: {
        style: {
          minHeight: "28px !important",
          fontSize: "12px",
          whiteSpace: "pre",
        },
      },
      headRow: {
        style: {
          minHeight: "30px",
          borderTopWidth: "1px",
          borderTopStyle: "solid",
          borderBottomWidth: "2px",
        },
      },
    };
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
        <div onContextMenu={(event) => this.showContextMenu(event)}>
          <DataTable
            columns={columns}
            data={this.state.items}
            customStyles={CustomStyle}
            onRowDoubleClicked={(row) => this.openChild(row)}
            onRowMouseEnter={(row) => this.rowMouseEnter(row)}
            onRowMouseLeave={(row) => this.rowMouseLeave(row)}
          />
        </div>
      </div>
    );
  }

  rowMouseEnter(row) {
    this.selected_row =
      (this.path[this.path.length - 1] === "/" ? this.path : this.path + "/") +
      row.name;
  }

  rowMouseLeave(row) {
    this.selected_row = null;
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
      console.log(this.path);
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
      this.context_menu_ref.current.displayContextMenu(left, top, this.selected_row);
    }
  }
}
