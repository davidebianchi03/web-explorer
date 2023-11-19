import React, { Component } from "react";
import "./context-menu.css";
import { DeletePath, DownloadPath } from "../http-requests/http-requests";
import Swal from "sweetalert2";

export class ContextMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      display: false,
      pos_x: 0,
      pos_y: 0,
      options: []
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

  display = (posx, posy, options) => {
    this.setState({
      display: true,
      pos_x: posx,
      pos_y: posy,
      options: options,
    });
  }

  render() {
    if (this.state.display) {

      let options = [];
      for (let i = 0; i < this.state.options.length; i++) {
        options.push(
          <li onClick={this.state.options[i].action}>
            <img src={this.state.options[i].icon} alt="" />
            <span>{this.state.options[i].title}</span>
          </li>
        );
      }
      return (
        <ul
          className="context-menu"
          ref={this.context_menu_ref}
          style={{ top: this.state.pos_y - 20, left: this.state.pos_x - 20 }}
          onContextMenu={(event) => { event.preventDefault(); }}
        >
          {options}
        </ul>
      );
    } else {
      return (<div></div>);
    }
  }
}
