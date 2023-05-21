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
                <th>Name</th>
                <th>Type</th>
            </thead>
            <tbody>
            </tbody>
        </table>
        `);

    // set path text input content
    this.window_body.children("input.path").val(`${this.url}`);

    // draw table
    // TODO: handle http errors
    var content_table = this.window_body
      .children("table.children-list");

    $.getJSON("/data/children/" +
      this.connection_uuid +
      "/" +
      encodeURIComponent(this.url), (data) => {
        console.log(data.children.length)
        for (let i = 0; i < data.children.length; i++) {
          content_table.children("tbody").append(`
          <tr>
            <td><img src="${data.children[i].icon}" style="width:20px;height:20px"></td>
            <td>${data.children[i].name}data</td>
            <td>${data.children[i].type}</td>
          </tr>
          `);
        }
      });
  }
}
