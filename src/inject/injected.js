var placeElement = $("header a[href='/project']");
placeElement.css("position", "relative");
placeElement.css("z-index", "9999");
updatePath();

$("header").append('<ul id="sl-tabs"></ul>');

function updatePath() {
    var selectedElement = $('.selected');

    placeElement.text(getDir(selectedElement));
}

function getDir(selectedElement) {
    var folders = $(selectedElement).parentsUntil().filter("div[ng-controller='FileTreeFolderController']");
    var path = "";
    for (var i = folders.length - 1; i >= 0; i--) {
        var folderNameElement = $(folders[i]).find("div div span.ng-binding")[0];
        path += ($(folderNameElement).text().replace(" ", "")) + "/";
    }
    return path;
}

var openfiles = [];
var allfiles = [];
var currentActiveFile = 0;
insertTab($('.selected').find(".entity-name.ng-isolate-scope.ui-draggable.ui-draggable-handle")[0]);

$("html").on("click", ".entity-name.ng-isolate-scope.ui-draggable.ui-draggable-handle", function(evt) {
    var el = this;
    var index = openfiles.findIndex(function(file) {return file.el == el;});
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


function newFile(el) {
    var file = {el: el, name: getname(el), dir: getDir(el)};
    file.path = getDir(el)+getname(el);
    return file;
}

$(window).keydown(function(event) {
    console.log(event.keyCode);
  if(event.altKey && event.keyCode == 80) { /* p */
    event.preventDefault();
    startFuzzySearch();
  }
});


function indexAllFiles() {
    allFiles = [];

    $('file-entity > li.ng-scope').each(
        function() {
            if(isFile($(this))) {
                allFiles.push(newFile($(this).find(".entity-name.ng-isolate-scope.ui-draggable.ui-draggable-handle")[0]));
            }
        }
    );

}

function startFuzzySearch() {
    indexAllFiles();
    $('.searchbox').remove();
    $('body').append(`<div class="searchbox"><input type="text" class="searchboxInput" /><ul class="searchboxResultsList"></ul></div>`);
    
    var h1 = $('.searchboxInput').on('input', function() {
        $('.searchboxResultsList').empty();
        var i = 5;
        var j = 0;
        var test = new RegExp($(this).val(), "ig");
        while(i-- > 0) {
            while(j < allFiles.length) {
                if(test.test(allFiles[j++].path)) {
                    $('.searchboxResultsList').append(`<li><span>${allFiles[j-1].path}</span></li>`);
                    break;
                }
            }
        }
    });

    var close = function() {
        h1.unbind();
        $('.searchbox').remove();
    };

    $('.searchboxInput').keyup(function() {if(event.keyCode == 27) close();})

    $('.searchboxInput').focus();
}

function isFile(el) {
    return $(el).children('div.entity[ng-if="entity.type != \'folder\'"]').length == 1;
}

function insertTab(el) {
    var file = newFile(el);
    openfiles.push(file);
    $("#sl-tabs").append("<li class='sl-tab'><span class='sl-tab-title' title='" + file.path + "'>" + file.name + "</span><a class='sl-tab-remove fa fa-times' href='#'></a></li>");
    setActiveTab(openfiles.length - 1);
}

function replaceTab(index, el) {
    var file = newFile(el);

    var tab = $("#sl-tabs").children().eq(index).find(".sl-tab-title").eq(0);
    tab.html(shortestPath(file, openfiles));
    tab.attr("title", file.path);
    openfiles[index] = file;
}

function setActiveTab(index) {
    $(".sl-tab").removeClass("sl-tab-active");
    $("#sl-tabs").children().eq(index).addClass("sl-tab-active");
    currentActiveFile = index;
}

function getname(el) {
    return $(el).find("span.ng-binding").eq(0).text().replace(" ", "");
}

function shortestPath(file, fileList) {
    var n = 1; /* number of slashes to include*/
    var a = file.path;
    var exp = new RegExp(`(\/?[^\/]+){${n}}$`);
    for(var i = 0; i < fileList.length; i++) {
        var b = fileList[i].path;
        if(a != b) {
            while(exp.test(a) && exp.exec(a)[0] == exp.exec(b)[0]) {
                if(exp.exec(a)[0].length != a.length) {
                    n++;
                    exp = new RegExp(`(\/?[^\/]+){${n}}$`);
                }
            }
        }
    }
    return exp.exec(a)[0];
}

$("html").on("click", ".sl-tab-title", function(evt) {
    openfiles[$(".sl-tab-title").index(this)].el.click();
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

$("html").on("click", "div.pdf-viewer.ng-scope", function() {
    setTimeout(function() {
        updatePath();
        var selected = $('.selected').find(".entity-name.ng-isolate-scope.ui-draggable.ui-draggable-handle")[0];
        var index = openfiles.findIndex(function(file) {return file.el == selected;});
        if (index != -1) {
            setActiveTab(index)
        } else {
            insertTab(selected);
        }

    }, 1000);
});