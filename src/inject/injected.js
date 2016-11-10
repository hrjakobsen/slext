var placeElement = $("header a[href='/project']");
placeElement.css("position", "relative");
placeElement.css("z-index", "9999");
updatePath();

$("header").append('<ul id="sl-tabs"></ul>');

function updatePath() {
    var selectedElement = $('.selected');

    placeElement.text(getPath(selectedElement));
}

function getPath(selectedElement) {
    var folders = $(selectedElement).parentsUntil().filter("div[ng-controller='FileTreeFolderController']");
    var path = "";
    for (var i = folders.length - 1; i >= 0; i--) {
        var folderNameElement = $(folders[i]).find("div div span.ng-binding")[0];
        path += ($(folderNameElement).text().replace(" ", "")) + "/";
    }
    return path;
}

var openfiles = []
var currentActiveFile = 0;
insertTab($('.selected').find(".entity-name.ng-isolate-scope.ui-draggable.ui-draggable-handle")[0]);

$("html").on("click", ".entity-name.ng-isolate-scope.ui-draggable.ui-draggable-handle", function(evt) {
    var index = openfiles.indexOf(this);
    if (!evt.shiftKey) {
        if (index == -1) {
            insertTab(this);
            setActiveTab(openfiles.length - 1);
        } else {
            if (index != currentActiveFile) {
                setActiveTab(index);
            }
        }
    } else {
        if (index == -1) {
            replaceTab(currentActiveFile, this)
        } else {
            if (index != currentActiveFile) {
                setActiveTab(index);
            }
        }
    }
    updatePath();
});


function insertTab(el) {
    openfiles.push(el);
    $("#sl-tabs").append("<li class='sl-tab'><span class='sl-tab-title' title='" + getPath(el) + getname(el) + "'>" + getname(el) + "</span><a class='sl-tab-remove fa fa-times' href='#'></a></li>");
    setActiveTab(openfiles.length - 1);
}

function replaceTab(index, el) {
    $($($("#sl-tabs").children()[index]).find(".sl-tab-title")[0]).html(getname(el));
    $($($("#sl-tabs").children()[index]).find(".sl-tab-title")[0]).attr("title", getPath(el) + getname(el));
    openfiles[index] = el;
}

function setActiveTab(index) {
    $(".sl-tab").removeClass("sl-tab-active");
    $($("#sl-tabs").children()[index]).addClass("sl-tab-active");
    currentActiveFile = index;
}

function getname(el) {
    return $($(el).find("span.ng-binding")[0]).text().replace(" ", "");
}

$("html").on("click", ".sl-tab-title", function(evt) {
    openfiles[$(".sl-tab-title").index(this)].click();
});

$("html").on("click", ".sl-tab-remove", function(evt) {
    if (openfiles.length < 2) return;
    var index = $(".sl-tab").index($(this).parent());
    if (currentActiveFile == $(".sl-tab").index($(this).parent())) {
        openfiles[currentActiveFile == 0 ? 1 : currentActiveFile - 1].click();
    }
    openfiles.splice(index, 1);
    $(this).parent().remove();
});

$("html").on("mouseup", ".sl-tab", function(e) {
    if (e.which == 2) {
        $(this).find(".sl-tab-remove")[0].click();
    }
});

$("div.ui-layout-east.ui-layout-pane.ui-layout-pane-east, div.ui-layout-center.ui-layout-pane.ui-layout-pane-center").click(function() {
    setTimeout(function() {
        updatePath();
        var selected = $('.selected').find(".entity-name.ng-isolate-scope.ui-draggable.ui-draggable-handle")[0];
        var index = openfiles.indexOf(selected);
        if (index != -1) {
            setActiveTab(index)
        } else {
            insertTab(selected);
        }

    }, 1000);
});