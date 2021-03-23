import { Slext } from "./slext";
import { Service, Container } from "typedi";
import { File } from "./file";
import * as $ from "jquery";
import { PageHook } from "./pagehook.service";
import { Shortcut } from "./shortcut.service";
declare var _debug_editors: [AceAjax.Editor];

@Service()
export class EditorCommands {
    lastWrappingCommand: string = null;
    private shortcut: Shortcut;

    constructor(private slext: Slext) {
        let self = this;
        this.shortcut = Container.get(Shortcut);

        this.shortcut.addEventListener("Meta+C", (e) => {
            e.preventDefault();
            self.wrapSelectedText();
        });

        this.shortcut.addEventListener("Meta+G", (e) => {
            self.jumpToFile();
            e.preventDefault();
        });
    }

    public wrapSelectedText() {
        let command = prompt("Wrapping command", this.lastWrappingCommand || "");
        if (command == null) return;
        command = command.replace(/ /g, ""); //remove all spaces
        this.lastWrappingCommand = command;
        let injectedFunction = function (command) {
            var editor = _debug_editors[0];
            let selection = editor.getSelection();
            let text = editor.getCopyText();
            let empty = selection.isEmpty();

            if (command == "") {
                editor.insert(`{${text}}`);
            } else {
                editor.insert(`\\${command}{${text}}`);
            }
            if (empty) {
                editor.navigateLeft(1);
            }
        };
        PageHook.call(injectedFunction, [command]);
    }

    public characterCount() {
        let injectedFunction = function () {
            var editor = _debug_editors[0];
            var text = editor.getSession().getDocument().getTextRange(editor.getSelectionRange());
            return text.length;
        };
        return PageHook.call(injectedFunction);
    }

    public jumpToFile() {
        let self = this;
        let findCurrentFile = function () {
            var editor = _debug_editors[0];
            var cursor = editor.getCursorPosition();
            return {
                row: cursor.row,
                col: cursor.column,
                text: editor.getSession().getLine(cursor.row),
            };
        };
        PageHook.call(findCurrentFile).then((x) => {
            let col: number = x.col;
            let row: number = x.row;
            let text: string = x.text;

            let possibleMatches = text.match(/\{([a-zA-Z0-9_\.\/]+)\}/gi) || [];
            possibleMatches = possibleMatches.map((x) => x.replace(/[{()}]/g, ""));
            possibleMatches.forEach((match) => {
                let firstPossibleStartPos = col - match.length;
                let lastPossibleEndPos = col + match.length;
                let sub = text.substring(firstPossibleStartPos, lastPossibleEndPos);
                if (sub.includes(match)) {
                    //This is a possible file to search for
                    let files = self.slext.getFiles().filter((f) => f.path.includes(match));
                    if (files.length) {
                        self.slext.selectFile(files[0]);
                    }
                }
            });
        });
    }
}
