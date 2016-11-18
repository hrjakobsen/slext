function GotoFileModule(slext) {
    var self = this;

    this.openFileUnderCursor = function() {
        var e = editors[0];
        var row = e.getCursorPosition().row;
        var col = e.getCursorPosition().column;
        var text = e.session.getLine(row);

        var matches = text.match(/([a-z0-9 ]{2})[a-z0-9 \/.]*/ig);
        relevantMatch = -1;
        for(var i = 0; i < matches.length; i++) {
            if(text.search(matches[i]) <= col && text.search(matches[i])+matches[i].length >= col) {
                relevantMatch = i; 
                break;
            }
        }
        if(relevantMatch < 0)
            return;
        for(var j = 0; j < slext.Files.length; j++) {
            if(slext.Files[j].path.length < matches[relevantMatch].length)
                continue;

            var endOfFilePath = new RegExp(".{"+matches[relevantMatch].length+"}$").exec(slext.Files[j].path.toLowerCase())[0];
            if(endOfFilePath.includes(matches[relevantMatch].toLowerCase())) {
                slext.Files[j].el.click();
                return;
            }
        }
    }

    $(window).keydown(function(event) {
        if(event.altKey && event.keyCode == 71) { /* g */
            event.preventDefault();
            self.openFileUnderCursor();
        }
    });
}