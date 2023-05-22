class FileExplorer extends Window {
  constructor(container_id, connection_uuid, base_url) {
    super(container_id);
    this.connection_uuid = connection_uuid;
    this.url = base_url;
  }

  draw_window() {
    super.draw_window();

    this.window_body.append(`
        <input type="text" class="path" placeholder="Enter Path">
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

    // set path text input content
    this.window_body.children("input.path").val(`${this.url}`);

    // draw table
    // TODO: handle http errors
    var content_table = this.window_body.children("table.children-list");

    const file_explorer_obj = this;
    ResizableTable(content_table);
    ReloadItems(this.url, this.connection_uuid, content_table).then(function () {


    });

  }
}

async function ReloadItems(relative_path, connection_uuid, content_table) {
  var data = await $.getJSON("/data/children/" + connection_uuid + "/" + encodeURIComponent(relative_path));
  content_table.children("tbody").empty();
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

  content_table.children("tbody").children("tr").dblclick(function () {
    if ($(this).attr('item-type') == "dir") {
      relative_path += "/" + $(this).attr('item-name');
      ReloadItems(relative_path, connection_uuid, content_table);
    }
  })
}