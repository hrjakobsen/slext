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
indexAllFiles();
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
            if (!$("#sl-tabs").children().eq(currentActiveFile).hasClass("sl-tab-favorite")) {
                replaceTab(currentActiveFile, this)
            } else {
                insertTab(this);
                setActiveTab(openfiles.length - 1);                
            }
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
    if(event.altKey && event.keyCode == 80) { /* p */
        event.preventDefault();
        startFuzzySearch();
    } else if(event.altKey && event.keyCode == 87) { /* w */
        event.preventDefault();
        $(".sl-tab.sl-tab-active").find(".sl-tab-remove")[0].click();
    } else if (event.altKey && event.keyCode == 68) { /* d */
        event.preventDefault();
        favoriteCurrentTab();
    } else if (event.altKey && event.keyCode == 72) { /* h */
        var prev = $('.sl-tab-active').prev();
        if(prev.length) {
            prev.find('.sl-tab-title').click();
        }
    } else if (event.altKey && event.keyCode == 76) { /* l */
        var next = $('.sl-tab-active').next();
        if(next.length) {
            next.find('.sl-tab-title').click();
        }
    }
});

function favoriteCurrentTab() {
    var tab = $(".sl-tab-active");
    if (tab.hasClass("sl-tab-favorite")) {
        tab.removeClass("sl-tab-favorite");
    } else {
        tab.addClass("sl-tab-favorite");
    }
}

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
    $('.searchbox').remove();
    $('body').append(`<div class="searchbox" id="sl-search"><input type="text" class="searchboxInput" /><ul class="searchboxResultsList"></ul></div>`);
    var currentSelection = 0;
    var h1 = $('.searchboxInput').on('input', function() {
        $('.searchboxResultsList').empty();
        var i = 5;
        var j = 0;
        while(i-- > 0) {
            while(j < allFiles.length) {
                if(allFiles[j++].path.toLowerCase().includes($(this).val().toLowerCase())) {
                    $('.searchboxResultsList').append(`<li index="${j-1}"><span>${allFiles[j-1].path}</span></li>`);
                    break;
                }
            }
        }
        setSelected(0);
        
    });


    var setSelected = function(index) {
        var children = $('.searchboxResultsList').children();
        var selected = Math.min(Math.max(index, 0), children.length - 1);
        if (children.length != 0) {
            children.removeClass("search-result-selected");
            children.eq(selected).addClass("search-result-selected");
        }
        return selected;
    }

    var close = function() {
        h1.unbind();
        clickListener.unbind();
        $('.searchbox').remove();
    };

    var chooseItem = function() {
        allFiles[$('.searchboxResultsList').children().eq(currentSelection).attr("index")].el.click();
    }

    $('.searchboxInput').keydown(function() {
        if(event.keyCode == 27) close();
        if (event.keyCode == 40) {event.preventDefault(); currentSelection = setSelected(currentSelection + 1);}
        if (event.keyCode == 38) {event.preventDefault(); currentSelection = setSelected(currentSelection - 1);}
        if (event.keyCode == 13) {
            chooseItem();
            close();
        };
    });

    var clickListener = $(document).click(function(e) {
        if (!(e.target.id == "sl-search" || $(e.target).parents("#sl-search").size())) { 
            close();
        }
    });


    $('.searchbox').on("click", ".searchboxResultsList>li", function() {
        allFiles[$(this).attr("index")].el.click();
        close();
    });

    $('.searchboxInput').focus();
}

function isFile(el) {
    return $(el).children('div.entity[ng-if="entity.type != \'folder\'"]').length == 1;
}

function updateTabNames() {
    $('.sl-tab').each(function() {
        var tabTitle = $(this).find('.sl-tab-title');
        var index = openfiles.findIndex(function(file) {return file.path == tabTitle.attr('title');});
        tabTitle.html(shortestPath(openfiles[index], openfiles));
    });
}

function insertTab(el) {
    var file = newFile(el);
    openfiles.push(file);
    $("#sl-tabs").append("<li class='sl-tab'><span class='sl-tab-title' title='" + file.path + "'>" + file.name + "</span><a class='sl-tab-remove fa fa-times' href='#'></a></li>");
    setActiveTab(openfiles.length - 1);
    updateTabNames();
}

function replaceTab(index, el) {
    var file = newFile(el);

    var tab = $("#sl-tabs").children().eq(index).find(".sl-tab-title").eq(0);
    tab.html(file.name);
    tab.attr("title", file.path);
    openfiles[index] = file;
    updateTabNames();
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
    return /^\/?(.*)/.exec(exp.exec(a)[0])[1];
}

$("html").on("click", ".sl-tab-title", function(evt) {
    openfiles[$(".sl-tab-title").index(this)].el.click();
});

$("html").on("click", ".sl-tab-remove", function(evt) {
    if (openfiles.length <= 1) return;
    if ($(this).parent().hasClass("sl-tab-favorite")) return;
    var index = $(".sl-tab").index($(this).parent());
    var filedeleted = currentActiveFile;
    var newIndex = currentActiveFile == 0 ? 1 : currentActiveFile - 1;
    if (currentActiveFile == index) {
        openfiles[newIndex].el.click();
    }
    openfiles.splice(index, 1);
    $(this).parent().remove();
    setActiveTab(filedeleted == 0 ? 0 : filedeleted - 1);
    updateTabNames();
});

$("html").on("mouseup", ".sl-tab", function(e) {
    if (e.which == 2) {
        $(this).find(".sl-tab-remove")[0].click();
    }
});

// watch for changes in file tree
var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
var obs = new MutationObserver(function(mutations, observer) {
    if(mutations[0].addedNodes.length || mutations[0].removedNodes.length)
        indexAllFiles();
});
obs.observe( $(".file-tree-inner")[0], { childList:true, subtree:true });


$("html").on("click", "div.pdf-viewer.ng-scope, .online-user", function() {
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

$( window ).unload(function() {
    SaveOpenedTabs();
});

function SaveOpenedTabs() {
    var openPaths = [];
    var tabs = $("#sl-tabs").children();
    for (var i = 0; i < openfiles.length; i++) {
        openPaths.push({path: openfiles[i].path, favorite: tabs.eq(i).hasClass("sl-tab-favorite")});
    }
    localStorage.setItem('openedFiles', JSON.stringify(openPaths));
}

function ReloadTabs() {
    var lastOpenedFiles = JSON.parse(localStorage.getItem('openedFiles'));
    if (lastOpenedFiles != null) {
        lastOpenedFiles.sort(function(a,b) {
        if (a.favorite) {
            if (b.favorite) {
                return 0;
            }
            return -1;
        } else if (b.favorite) {      
            return 1;
        }
        return 0;
        });
        indexAllFiles();
        openfiles = []
        $("#sl-tabs").empty();
        for (var j = 0; j < lastOpenedFiles.length; j++) {
            var index = allFiles.findIndex(function(file) {return file.path == lastOpenedFiles[j].path;});
            if (index != -1) {
                var openIndex = openfiles.findIndex(function(file) {return file.path == lastOpenedFiles[j].path});
                if (openIndex == -1) {
                    insertTab(allFiles[index].el);
                    if (lastOpenedFiles[j].favorite) {
                        $(".sl-tab").last().addClass("sl-tab-favorite");
                    }
                    setActiveTab(0);
                } else if (lastOpenedFiles[j].favorite){
                    $("#sl-tabs").children().eq(j).addClass("sl-tab-favorite");
                }
            }
        }
        $(openfiles[0].el).click(); 
    }
    
}

ReloadTabs();

$("#sl-loadscreen").remove();