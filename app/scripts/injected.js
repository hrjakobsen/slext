/* global document, CustomEvent, _debug_editors, Event */
document.addEventListener("variable_query", function (evt) {
    var query = evt.detail;
    var res = eval(query);
    var resEvent = new CustomEvent("variable_query_" + query, { detail: res });
    document.dispatchEvent(resEvent);
});

// eslint-disable-next-line no-undef
window.addEventListener("UNSTABLE_editor:extensions", (event) => {
    const { CodeMirror, extensions } = event.detail;

    const { EditorSelection, ViewPlugin } = CodeMirror;

    const requestLineInfo = ViewPlugin.define((view) => {
        const provideCurrentLineInfo = () => {
            if (view.state.selection.ranges.length != 1) {
                return;
            }
            const selection = view.state.selection.ranges[0];
            const line = view.state.doc.lineAt(selection.from);
            const result = {
                row: line.number,
                column: selection.from - line.from,
                text: line.text,
            };
            document.dispatchEvent(new CustomEvent("slext:codemirror:provideLineInfo", { detail: result }));
        };
        document.addEventListener("slext:codemirror:requestLineInfo", provideCurrentLineInfo);

        return {
            destroy: () => {
                document.removeEventListener("slext:codemirror:requestLineInfo");
            },
        };
    });
    extensions.push(requestLineInfo);

    const requestSelectionLength = ViewPlugin.define((view) => {
        const provideSelectionLength = () => {
            if (view.state.selection.ranges.length != 1) {
                return;
            }
            const selection = view.state.selection.ranges[0];
            document.dispatchEvent(
                new CustomEvent("slext:codemirror:provideSelectionLength", { detail: selection.to - selection.from })
            );
        };
        document.addEventListener("slext:codemirror:requestSelectionLength", provideSelectionLength);

        return {
            destroy: () => {
                document.removeEventListener("slext:codemirror:requestSelectionLength");
            },
        };
    });
    extensions.push(requestSelectionLength);

    const requestWrapInCommand = ViewPlugin.define((view) => {
        const wrapInCommand = (event) => {
            const { prefix, suffix } = JSON.parse(event.detail);

            if (view.state.selection.ranges.length != 1) {
                return;
            }

            view.dispatch(
                view.state.changeByRange((range) => {
                    const isEmpty = range.to - range.from;
                    const changes = view.state.changes([
                        {
                            from: range.from,
                            insert: prefix,
                        },
                        {
                            from: range.to,
                            insert: suffix,
                        },
                    ]);
                    if (isEmpty) {
                        return {
                            range: EditorSelection.range(
                                changes.mapPos(range.from),
                                changes.mapPos(range.to) + suffix.toString().length
                            ),
                            changes,
                        };
                    } else {
                        return {
                            range: EditorSelection.cursor(changes.mapPos(range.from) + prefix.toString().length),
                            changes,
                        };
                    }
                })
            );
        };
        document.addEventListener("slext:codemirror:wrapInCommand", wrapInCommand);

        return {
            destroy: () => {
                document.removeEventListener("slext:codemirror:wrapInCommand");
            },
        };
    });
    extensions.push(requestWrapInCommand);
});

var limit = 50;
var tries = 0;
var int = setInterval(function () {
    try {
        if (_debug_editors && _debug_editors.length) {
            clearInterval(int);
            var editor = _debug_editors[0];
            editor.on("changeSession", function () {
                var event = new Event("slext_editorChanged");
                document.dispatchEvent(event);
            });
        }
        tries++;
    } catch (e) {
        if (!(e instanceof ReferenceError)) throw e;
        if (tries++ >= limit) clearInterval(int);
    }
}, 100);
