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
    $("#path-"+this.window_uuid).attr("value", this.url);

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
      $("#path-"+this.window_uuid).attr("value", this.url);

      const file_explorer_parent = this;
      content_table.children("tbody").children("tr").dblclick(function () {
        if ($(this).attr("item-type") == "dir") {
          if (file_explorer_parent.url[file_explorer_parent.url.length - 1] != "/") {
            file_explorer_parent.url += "/";
          }
          file_explorer_parent.url += $(this).attr("item-name");
          file_explorer_parent.DisplayFolders();
        }
      });
    });
  }
}