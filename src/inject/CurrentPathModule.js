function CurrentPathModule(slext, settings) {
    var self = this;
    this.style = null;
    this.setStyles = function() {
        if (this.style != null) {
            this.style.remove();
        }
        this.style = insertStylerules(`
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
    }

    this.setStyles();

    settings.addEventListener("themeChanged", function() {
        self.setStyles();
    });
    $('a[tooltip="Back to projects"]').after("<span id='sl-path'></span>")
    slext.addEventListener("FileClicked", function(data) {
        $("#sl-path").text(data.file.path);
    });
    $("#sl-path").text(slext.getCurrentFile().path);
}