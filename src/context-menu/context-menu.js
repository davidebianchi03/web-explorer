import React, { Component } from "react";
import "./context-menu.css";

export class ContextMenu extends Component {
  constructor(props) {
    super(props);
    this.filepath = props.filepath;
    this.pos_x = props.x;
    this.pos_y = props.y;
    this.close = props.close;
    this.context_menu = React.createRef();
  }

  documentClickEvent(event) {
    if(event.clientX < this.pos_x || event.clientX > this.pos_x + 150){
        console.log(event)
    }
  }

  render() {
    console.log(this.context_menu)
    document.onclick = (event) => this.documentClickEvent(event);
    return (
      <ul className="context-menu" ref={this.context_menu}>
        <li>Open</li>
        <li>Download</li>
        <li>Properties</li>
      </ul>
    );
  }
}
