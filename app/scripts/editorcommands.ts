import { Slext } from "./slext";
import { Service, Container } from "typedi";
import { PageHook } from "./pagehook.service";
import { Shortcut } from "./shortcut.service";
declare let _debug_editors: [AceAjax.Editor];

@Service()
export class EditorCommands {
    lastWrappingCommand: string = null;
    private shortcut: Shortcut;

    constructor(private slext: Slext) {
        this.shortcut = Container.get(Shortcut);

        this.shortcut.addEventListener("Meta+C", (e) => {
            e.preventDefault();
            this.wrapSelectedText();
        });

        this.shortcut.addEventListener("Meta+G", (e) => {
            this.jumpToFile();
            e.preventDefault();
        });
    }

    public wrapSelectedText(): void {
        let command = prompt("Wrapping command", this.lastWrappingCommand || "");
        if (command == null) return;
        command = command.replace(/ /g, ""); //remove all spaces
        this.lastWrappingCommand = command;
        const injectedFunction = function (command) {
            const editor = _debug_editors[0];
            const selection = editor.getSelection();
            const text = editor.getCopyText();
            const empty = selection.isEmpty();

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

    public characterCount(): Promise<any> {
        const injectedFunction = function () {
            const editor = _debug_editors[0];
            const text = editor.getSession().getDocument().getTextRange(editor.getSelectionRange());
            return text.length;
        };
        return PageHook.call(injectedFunction);
    }

    public jumpToFile(): void {
        const findCurrentFile = function () {
            const editor = _debug_editors[0];
            const cursor = editor.getCursorPosition();
            return {
                row: cursor.row,
                col: cursor.column,
                text: editor.getSession().getLine(cursor.row),
            };
        };
        PageHook.call(findCurrentFile).then((x) => {
            const col: number = x.col;
            const text: string = x.text;

            let possibleMatches = text.match(/\{([a-zA-Z0-9_./]+)\}/gi) || [];
            possibleMatches = possibleMatches.map((x) => x.replace(/[{()}]/g, ""));
            possibleMatches.forEach((match) => {
                const firstPossibleStartPos = col - match.length;
                const lastPossibleEndPos = col + match.length;
                const sub = text.substring(firstPossibleStartPos, lastPossibleEndPos);
                if (sub.includes(match)) {
                    //This is a possible file to search for
                    const files = this.slext.getFiles().filter((f) => f.path.includes(match));
                    if (files.length) {
                        this.slext.selectFile(files[0]);
                    }
                }
            });
        });
    }
}
