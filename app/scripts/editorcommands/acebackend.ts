import { PageHook } from "../pagehook.service";
import { EditorBackend, EditorLine } from "./editorcommands";

declare let _debug_editors: [AceAjax.Editor];

export class AceEditorBackend implements EditorBackend {
    backslash(): string {
        return "\\\\";
    }
    wrapSelection(prefix: string, suffix: string) {
        const injectedFunction = function (prefix, suffix) {
            const editor = _debug_editors[_debug_editors.length - 1];
            const selection = editor.getSelection();
            const text = editor.getCopyText();
            const empty = selection.isEmpty();

            editor.insert(`${prefix}${text}${suffix}`);

            if (empty) {
                editor.navigateLeft(suffix.length);
            }
        };
        PageHook.call(injectedFunction, [prefix, suffix]);
    }
    getSelectionLength(): Promise<number> {
        const injectedFunction = function () {
            const editor = _debug_editors[_debug_editors.length - 1];
            const text = editor.getSession().getDocument().getTextRange(editor.getSelectionRange());
            return text.length;
        };
        return PageHook.call(injectedFunction);
    }

    getCurrentLine(): Promise<EditorLine> {
        const injectedFunction = function () {
            const editor = _debug_editors[_debug_editors.length - 1];
            const cursor = editor.getCursorPosition();
            return {
                column: cursor.column,
                row: cursor.row,
                text: editor.getSession().getLine(cursor.row),
            };
        };
        return PageHook.call(injectedFunction);
    }
}
