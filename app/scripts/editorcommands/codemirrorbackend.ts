import { EditorBackend, EditorLine } from "./editorcommands";

export class CodeMirrorEditorBackend implements EditorBackend {
    backslash(): string {
        return "\\";
    }
    wrapSelection(prefix: string, suffix: string) {
        document.dispatchEvent(
            new CustomEvent("slext:codemirror:wrapInCommand", {
                detail: JSON.stringify({ prefix, suffix }),
            })
        );
    }
    getSelectionLength(): Promise<number> {
        return new Promise((resolve, _reject) => {
            const listener = (evt: CustomEvent) => {
                const length = evt.detail;
                document.removeEventListener("slext:codemirror:provideSelectionLength", listener);
                resolve(length);
            };
            document.addEventListener("slext:codemirror:provideSelectionLength", listener);
            document.dispatchEvent(new Event("slext:codemirror:requestSelectionLength"));
        });
    }
    getCurrentLine(): Promise<EditorLine> {
        return new Promise((resolve, _reject) => {
            const listener = (evt: CustomEvent) => {
                const result = evt.detail;
                document.removeEventListener("slext:codemirror:provideLineInfo", listener);
                resolve(result);
            };
            document.addEventListener("slext:codemirror:provideLineInfo", listener);
            document.dispatchEvent(new Event("slext:codemirror:requestLineInfo"));
        });
    }
}
