document.addEventListener("variable_query", function (evt) {
    var query = evt.detail;
    var res = eval(query);
    var resEvent = new CustomEvent("variable_query_" + query, { detail: res });
    document.dispatchEvent(resEvent);
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
