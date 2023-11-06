import React, { Component } from "react";
import "./context-menu.css";
import { DownloadPath } from "../http-requests/http-requests";
import open_icon from "../img/open.png";
import download_icon from "../img/download.png";
import menu_icon from "../img/menu.png";
import upload_icon from "../img/upload.png";
import Swal from "sweetalert2";

export class ContextMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      display: false,
      pos_x: 0,
      pos_y: 0,
      filepath: null,
      item_type: null,
    };
    this.context_menu_ref = React.createRef();
  }

  componentDidMount = () => {
    document.addEventListener('click', (event) => {
      if (this.state.display) {
        this.setState({ display: false });
      }
    })
  }

  displayContextMenu = (posx, posy, filepath, item_type) => {
    this.setState({
      display: true,
      pos_x: posx,
      pos_y: posy,
      filepath: filepath,
      item_type: item_type,
    });

  }

  render() {
    if (this.state.display) {
      return (
        <ul className="context-menu" ref={this.context_menu_ref} style={{ top: this.state.pos_y - 20, left: this.state.pos_x - 20 }}>
          <li>
            <img src={open_icon} alt="" />
            <span>Open</span>
          </li>
          <li onClick={this.handleDownload}>
            <img src={download_icon} alt="" />
            <span>Download</span>
          </li>
          <li>
            <img src={upload_icon} alt="" />
            <span>Upload</span>
          </li>
          <li>
            <img src={menu_icon} alt="" />
            <span>Properties</span>
          </li>
        </ul>
      );
    } else {
      return (<div></div>);
    }
  }

  handleDownload = async () => {
    let path = this.state.filepath.split("/");

    let filename = path[path.length - 1];
    if (this.state.item_type === 'dir') {
      filename += ".tar.gz";
    }
    Swal.fire("Downloading file", "It may take a lot of time...", 'info');
    await DownloadPath(this.state.filepath, filename);
    Swal.close();
  }
}
