class FileExplorer extends Window {
  constructor(container_id, connection_uuid, base_url) {
    super(container_id);
    this.connection_uuid = connection_uuid;
    this.url = base_url;
  }

  draw_window() {
    super.draw_window();
    this.window_body.append(`
        <div class="navigation-bar">
          <button class="up-button" id="parent-btn-${this.window_uuid}">
            <img src="/static/img/up.svg">
          </button>
          <input type="text" class="path" placeholder="Enter Path" id="path-${this.window_uuid}" value="dfsdf">
        </div>
        <table class="children-list" style="font-size:14px;user-select:none;">
            <thead>
                <th></th>
                <th>Name<div class="resizer"></div></th>
                <th>Type<div class="resizer"></div></th>
            </thead>
            <tbody>
            </tbody>
        </table>
    `);

    // add event listener on button parent click
    $("#parent-btn-" + this.window_uuid).click(this.ParentFolder);

    // set path text input content
    $("#path-" + this.window_uuid).attr("value", this.url);

    this.DisplayFolders();
  }

  ParentFolder = event => {
    let splitted_path = this.url.split("/");
    if (splitted_path.length > 0) {
      if (this.url[this.url.length - 1] == '/') {
        this.url = this.url.substring(0, this.url.length - 1);
      }
      let index = this.url.lastIndexOf("/");
      if (index != -1) {
        this.url = this.url.substring(0, index + 1);
        this.DisplayFolders();
      }
    }
  }

  DisplayFolders = event => {
    // remove old items
    var content_table = this.window_body.children("table.children-list");
    content_table.children("tbody").empty();

    // populate table with new items
    $.getJSON("/data/children/" + this.connection_uuid + "/" + encodeURIComponent(this.url)).then(data => {
      for (let i = 0; i < data.children.length; i++) {
        content_table.children("tbody").append(`
        <tr item-name="${data.children[i].name}" item-type="${data.children[i].type}">
          <td>
            <div class="horizontal-resizable-cell">
              <img src="${data.children[i].icon}" style="width:20px;height:20px">
            </div>
          </td>
            <div class="horizontal-resizable-cell" style="width:25%">
              <td>${data.children[i].name}</td>
            </div>
          </td>
          <td>
            <div class="horizontal-resizable-cell" style="width:100%">
              ${data.children[i].type}
            </div>
          </td>
        </tr>
        `);
      }

      // update the displayed path
      $("#path-" + this.window_uuid).attr("value", this.url);


      const file_explorer_parent = this;

      // double click event handler
      content_table.children("tbody").children("tr").dblclick(this.OpenChildElement);

      // right button click event handler
      content_table.children("tbody").children("tr").on("contextmenu", this.ContextMenu);
    });
  }

  OpenChildElement = event => {
    let sender = event.currentTarget;
    if ($(sender).attr("item-type") == "dir") {
      if (this.url[this.url.length - 1] != "/") {
        this.url += "/";
      }
      this.url += $(sender).attr("item-name");
      this.DisplayFolders();
    }
  }

  ContextMenu = event => {
    event.preventDefault();
    // if there is a context menu just opened close it
    if ($("#file-explorer-context-menu").length) {
      $("#file-explorer-context-menu").remove();
    }
    let sender = event.currentTarget;

    if ($(sender).attr("item-type") == "dir") {
      // sender html tag is a directory
    } else {
      // sender html tag is a file
      $(sender).append(`
        <ul id = "file-explorer-context-menu" file-path="${this.url + "/" + $(sender).attr("item-name")}">
          <li>
            <img src="/static/img/context-menu/open.svg">
            <span>Open</span>
          </li>
          <li id="download">
              <img src="/static/img/context-menu/download.svg">
              <span>Download</span>
          </li>
          <li>
            <img src="/static/img/context-menu/rename.svg">
            <span>Rename</span>
          </li>
          <li>
            <img src="/static/img/context-menu/delete.svg">
            <span>Delete</span>
          </li>
          <li>
            <img src="/static/img/context-menu/properties.svg">
            <span>Properties</span>
          </li>
        </ul>
      `);
      let ctx_menu_left = event.clientX - $("#file-explorer-context-menu").parent("tr").offset().left;
      $("#file-explorer-context-menu").css({ left: ctx_menu_left });
    }

    $("#file-explorer-context-menu").children("li#download").click(this.ContextMenuDownloadFile)

    $(document).click(() => {
      // if there is a context menu just opened close it
      if ($("#file-explorer-context-menu").length) {
        $("#file-explorer-context-menu").remove();
      }
    });
  }

  ContextMenuDownloadFile = () =>{
    let filepath = $("#file-explorer-context-menu").attr("file-path");
    location.href = "/data/download/" + this.connection_uuid + "/" + encodeURIComponent(filepath);
  }
}