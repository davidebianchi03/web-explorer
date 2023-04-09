constGenerateUUID = () =>
  ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );

class Window {
  constructor(container_id, connection_uuid) {
    this.container = $(container_id);
    this.window_uuid = constGenerateUUID();
    this.width = 800;
    this.height = 400;
    this.connection_uuid = connection_uuid;
  }

  draw_window() {
    var window =
      `
        <div class="window" id="` +
      this.window_uuid +
      `">
            <div class="draggable-bar">
                <div class="buttons">
                    <button class="minimize"><img src="/static/img/minimize.png"></button>
                    <button class="maximize"><img src="/static/img/maximize.png"></button>
                    <button class="close"><img src="/static/img/close.png"></button>
                </div>
            </div>
            <div class="window-body">
              <table class="children-list">
                <thead>
                  <th></th>
                  <th>Name</th>
                  <th>Type</th>
                </thead>
                <tbody>
                </tbody>
              </table>
            </div>
        </div>`;
    this.container.append(window);

    // populate window with initial values
    // TODO: take root value from settings or from /data/root/:id
    $.getJSON("/data/children/" + this.connection_uuid + "/%2F", (data) => {
      // TODO: handle 404
      for (let i = 0; i < data.children.length; i++) {
        let child = data.children[i];
        // TODO: use bootstrap datatable
        $("#" + this.window_uuid)
          .children("div.window-body")
          .children("table.children-list")
          .children("tbody").append(`
              <tr>
                <td>// TODO: icons</td>
                <td>${child.name}</td>
                <td>${child.type == "dir" ? "Folder" : "File"}</td>
              </tr>`);
      }
    });

    // buttons
    $("#" + this.window_uuid).width(this.width);
    $("#" + this.window_uuid).height(this.height);
    $("#" + this.window_uuid)
      .children("div.draggable-bar")
      .mousedown((e) => {
        e = e || window.event;
        e.preventDefault();
        let offset_x = e.clientX - $("#" + this.window_uuid).position().left;

        $(document).mousemove((e) => {
          e = e || window.event;
          e.preventDefault();
          $("#" + this.window_uuid).css({
            top: e.clientY,
            left: e.clientX - offset_x,
          });
        });

        $(document).mouseup((e) => {
          e = e || window.event;
          e.preventDefault();
          $(document).unbind("mousemove");
          $(document).unbind("mouseup");
        });
      });

    // Close button pressed event
    $("#" + this.window_uuid)
      .children("div.draggable-bar")
      .children("div.buttons")
      .children("button.close")
      .click(() => {
        $("#" + this.window_uuid).remove();
      });
  }
}
