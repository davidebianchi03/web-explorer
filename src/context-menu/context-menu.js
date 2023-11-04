import React, { Component } from "react";
import "./context-menu.css";
import { DownloadFile } from "../http-requests/http-requests";

export class ContextMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      display: false,
      pos_x: 0,
      pos_y: 0,
      filepath: null,
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

  displayContextMenu = (posx, posy, filepath) => {
    this.setState({
      display: true,
      pos_x: posx,
      pos_y: posy,
      filepath:filepath
    });

  }

  render() {
    if (this.state.display) {
      return (
        <ul className="context-menu" ref={this.context_menu_ref} style={{ top: this.state.pos_y - 20, left: this.state.pos_x - 20 }}>
          <li>Open</li>
          <li onClick={this.handleDownload}>Download</li>
          <li>Properties</li>
        </ul>
      );
    } else {
      return (<div></div>);
    }
  }

  handleDownload = () => {
    let path = this.state.filepath.split("/");
    let filename = path[path.length - 1];
    DownloadFile(this.state.filepath, filename);
  }
}
