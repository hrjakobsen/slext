import { Slext } from './slext';
import { Service } from 'typedi';
import { File } from './file';
import * as $ from 'jquery';
import { PageHook } from './pagehook.service';
declare var _debug_editors: [AceAjax.Editor];


@Service()
export class EditorCommands {
    constructor(private slext: Slext) {
        let self = this;
        $(document).keydown(function (e) {
            let functions = {
                67: () => self.wrapSelectedText(),
                71: () => self.jumpToFile()
            }
            if (e.altKey && functions[e.which]) {
                functions[e.which]();
            }
        });
    }

    public wrapSelectedText() {
        let command = prompt("Wrapping command");
        if (command == null) return;
        let injectedFunction = function (command) {
            var editor = _debug_editors[0];
            var range = editor.getSelectionRange();
            var start = range.start,
                end = range.end;
            editor.getSession().insert(end, "}");
            editor.getSession().insert(start, (command ? "\\" : "") + command + "{");
            editor.clearSelection();
        }
        PageHook.call(injectedFunction, [command]);
    }

    public jumpToFile() {
        let self = this;
        let findCurrentFile = function () {
            var editor = _debug_editors[0];
            var cursor = editor.getCursorPosition();
            return {
                row: cursor.row,
                col: cursor.column,
                text: editor.getSession().getLine(cursor.row)
            };
        }
        PageHook.call(findCurrentFile).then(x => {
            let col: number = x.col;
            let row: number = x.row;
            let text: string = x.text;

            let possibleMatches = text.match(/\{([a-zA-Z0-9_\.\/]+)\}/ig) || [];
            possibleMatches = possibleMatches.map(x => x.replace(/[{()}]/g, ''));
            possibleMatches.forEach(match => {
                let firstPossibleStartPos = col - match.length;
                let lastPossibleEndPos = col + match.length;
                let sub = text.substring(firstPossibleStartPos, lastPossibleEndPos);
                if (sub.includes(match)) {
                    //This is a possible file to search for
                    let files = self.slext.getFiles().filter(f => f.path.includes(match));
                    if (files.length) {
                        $(files[0].handle).click();
                    }
                }
            });

        });
    }
}