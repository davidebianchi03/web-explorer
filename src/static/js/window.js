constGenerateUUID = () =>
  ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );

class Window {
  constructor(container_id) {
    this.container = $(container_id);
    this.window_uuid = constGenerateUUID();
    this.width = 800;
    this.height = 400;
    this.window_body = null;
    this.maximized = false;
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
            </div>
        </div>`;
    this.container.append(window);
    this.window_body = $("#" + this.window_uuid).children("div.window-body");

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
          this.maximized = false;
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

    $("#" + this.window_uuid)
      .children("div.draggable-bar")
      .children("div.buttons")
      .children("button.maximize")
      .click(() => {
        this.maximized = !this.maximized;
        if (this.maximized) {
          this.previous_position = {
            top: $("#" + this.window_uuid).position().top,
            left: $("#" + this.window_uuid).position().left,
            width: $("#" + this.window_uuid).width(),
            height: $("#" + this.window_uuid).height(),
          };
          $("#" + this.window_uuid).css({
            top: 0,
            left: 65,
            width: "calc(100% - 80px)",
            height: "100%",
          });
        } else {
          $("#" + this.window_uuid).css({
            top: this.previous_position.top,
            left: this.previous_position.left,
            width: this.previous_position.width,
            height: this.previous_position.height,
          });
        }
      });
  }
}
