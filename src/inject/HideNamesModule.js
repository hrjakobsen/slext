function HideNamesModule(slext, options) {
    var self = this;
    this.style = null;
    this.setStyles = function() {
        if (this.style != null) {
            this.style.remove();
        }

        var styles = `
            .ace-editor-wrapper .annotation-label {
                display:none;
            }
        `;

        if (settings.hideCursors) {
            styles += `
            .remote-cursor {
                display:none !important;
            }
        `
        }
        this.style = insertStylerules(styles);
    }

    this.setStyles();
}
