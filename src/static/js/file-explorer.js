class FileExplorer extends Window {
  constructor(container_id, connection_uuid) {
    super(container_id);
    this.connection_uuid = connection_uuid;
  }

  draw_window() {
    super.draw_window();

    this.window_body.append(`
        <table class="children-list">
            <thead>
                <th></th>
                <th>Name</th>
                <th>Type</th>
            </thead>
            <tbody>
            </tbody>
        </table>
        `);

    // draw table
    var content_table = $("#" + this.window_uuid)
      .children("div.window-body")
      .children("table.children-list").DataTable({
        "processing": true,
        select: true,
        bPaginate: false,
        ajax: {
            url:"/data/children/" + this.connection_uuid + "/%2F",
            dataSrc: 'children',
        },
        columns: [
            {
                data: null
            },
            {
                data: "name"
            },
            {
                data: "type",
                render: function(data, type, row){
                    return data == "dir" ? "Folder" : "File";
                }
            }
        ]
      });

    // populate window with initial values
    // TODO: take root value from settings or from /data/root/:id
    // $.getJSON("/data/children/" + this.connection_uuid + "/%2F", (data) => {
    //   // TODO: handle 404
    //   for (let i = 0; i < data.children.length; i++) {
    //     let child = data.children[i];
    //     // TODO: use bootstrap datatable
    //     content_table.children("tbody").append(`
    //             <tr>
    //                 <td>// TODO: icons</td>
    //                 <td>${child.name}</td>
    //                 <td>${child.type == "dir" ? "Folder" : "File"}</td>
    //             </tr>`);
    //   }

    // });
  }
}
