/* global document, CustomEvent, Event */

document.addEventListener("slext:initializeStoreWatchers", () => {
    window.overleaf?.unstable.store.watch(
        "project",
        (project) => {
            var resEvent = new CustomEvent("slext:setProject", { detail: project });
            document.dispatchEvent(resEvent);
        },
        true
    );

    window.overleaf?.unstable.store.watch("editor.open_doc_id", (id) => {
        var resEvent = new CustomEvent("slext:fileChanged", { detail: id });
        document.dispatchEvent(resEvent);
    });
});

document.addEventListener("slext:doFileChange", ({ detail: id }) => {
    window.dispatchEvent(new CustomEvent("editor.openDoc", { detail: id }));
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
