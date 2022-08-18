import { Slext } from "../slext";
import { Service, Container } from "typedi";
import { Shortcut } from "../shortcut.service";
import { AceEditorBackend } from "./acebackend";
import { CodeMirrorEditorBackend } from "./codemirrorbackend";

enum CodeEditor {
    ACE,
    CODE_MIRROR,
}

export interface EditorLine {
    row: number;
    column: number;
    text: string;
}

export interface EditorBackend {
    wrapSelection(prefix: string, suffix: string);
    getSelectionLength(): Promise<number>;
    getCurrentLine(): Promise<EditorLine>;
    backslash(): string;
}

@Service()
export class EditorCommands {
    lastWrappingCommand: string = null;
    private shortcut: Shortcut;
    private aceBackend = new AceEditorBackend();
    private codeMirrorBackend = new CodeMirrorEditorBackend();

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
        this.shortcut.addEventListener("Meta+F", (e) => {
            this.jumpToFile();
            e.preventDefault();
        });

        this.shortcut.addEventListener("Meta+Y", (e) => {
            slext.toggleFullScreenPDFEditor();
            e.preventDefault();
        });

        this.shortcut.addEventListener("Meta+U", (e) => {
            slext.goToSplitScreen();
            e.preventDefault();
        });
    }

    private getCurrentCodeEditor() {
        const editorSelector = document.querySelector('input[name="editor"]:checked');
        if (editorSelector instanceof HTMLInputElement && editorSelector.value == "cm6") {
            return CodeEditor.CODE_MIRROR;
        }
        return CodeEditor.ACE;
    }

    private getBackend(): EditorBackend {
        const currentEditorType = this.getCurrentCodeEditor();
        switch (currentEditorType) {
            case CodeEditor.ACE:
                return this.aceBackend;
            case CodeEditor.CODE_MIRROR:
                return this.codeMirrorBackend;
            default:
                throw new Error("No backend found for current editor " + currentEditorType);
        }
    }

    public wrapSelectedText(): void {
        let command = prompt("Wrapping command", this.lastWrappingCommand || "");
        if (command == null) return;
        command = command.replace(/ /g, ""); //remove all spaces
        this.lastWrappingCommand = command;
        let prefix = "{";
        const suffix = "}";

        prefix = (command.length ? this.getBackend().backslash() + command : "") + prefix;

        this.getBackend().wrapSelection(prefix, suffix);
    }

    public characterCount(): Promise<number> {
        return this.getBackend().getSelectionLength();
    }

    public jumpToFile(): void {
        this.getBackend()
            .getCurrentLine()
            .then((line) => {
                const col: number = line.column;
                const text: string = line.text;

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
