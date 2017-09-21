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

        function searchForFiles(file) {
            for(var j = 0; j < slext.Files.length; j++) {
                if(slext.Files[j].path.length < file.length)
                    continue;

                var endOfFilePath = new RegExp(".{"+file.length+"}$").exec(slext.Files[j].path.toLowerCase())[0];
                
                if(endOfFilePath.includes(file.toLowerCase())) {
                    slext.Files[j].el.click();
                    return true;
                }
            }
            return false;
        }

        if (searchForFiles(matches[relevantMatch])) return;

        //Didn't match anything, maybe it is missing a file extension
        var fileToSearchFor = matches[relevantMatch];
        if (fileToSearchFor.indexOf(".") < 0) {
            fileToSearchFor = fileToSearchFor + ".tex";
            searchForFiles(fileToSearchFor);
        }
    }

    $(window).keydown(function(event) {
        if(event.altKey && event.keyCode == 71) { /* g */
            event.preventDefault();
            self.openFileUnderCursor();
        }
    });
}
