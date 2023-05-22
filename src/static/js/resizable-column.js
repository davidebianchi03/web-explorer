function ResizableTable(table) {

    // resizable-table
    table.addClass("resizable-table");

    let table_headers = table.find("th");

    // TODO: programmatically add "resizer" class to resizable table's column headers 

    $(".resizer").mousedown(function (event) {
        var column = $(this);
        $(document).mousemove(function (event) {
            let parent = column.parent();
            let width = event.clientX - (parent.position().left + parent.width());
            parent.width(width);
        });
        $(document).mouseup(function(event){
            $(document).off("mousemove");
            $(document).off("mouseup");
        });
    });
}