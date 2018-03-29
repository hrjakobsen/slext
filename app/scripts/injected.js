document.addEventListener("variable_query", function (evt) {
    var query = evt.detail;
    var res = eval(query);
    var resEvent = new CustomEvent("variable_query_" + query, { detail: res });
    document.dispatchEvent(resEvent);
});