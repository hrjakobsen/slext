function CurrentPathModule(slext, settings) {
    var self = this;
    insertStylerules(`
        #sl-path:before {
            content: "\\1F5C1 ";
        }
        #sl-path {
            color:${settings.tabTextColor};
            position:relative;
            z-index:100000;
            background-color:inherit;
        }
        `);
    $('a[tooltip="Back to projects"]').after("<span id='sl-path'></span>")
    slext.addEventListener("FileClicked", function(data) {
        $("#sl-path").text(data.file.path);
    });
    $("#sl-path").text(slext.getCurrentFile().path);
}