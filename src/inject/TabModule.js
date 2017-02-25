function TabModule(slext, settings) {
    if (!$("#sl-tabs").length) {
        $("header").append('<div id="sl-tab-container"><ul id="sl-tabs"></ul><a id="sl-right" class="sl-tab-navigator" href="#"><i class="fa fa-arrow-right" aria-hidden="true"></i></a><a class="sl-tab-navigator" id="sl-left" href="#"><i class="fa fa-arrow-left" aria-hidden="true"></i></a></div>');
    }
    this.style = null;
    this.setStyles = function() {
        if (this.style != null) {
            this.style.remove();
        }
        this.style = insertStylerules(`
            header {
                height: 80px !important;
            }
            .sl-tab {
                display: inline-block;
                background-color: ${settings.tabBackgroundColor};
                padding: 0 5px;
                color:${settings.tabTextColor};
            }
            .sl-tab:hover {
                background-color: ${settings.tabHover};
            }
            #sl-tabs {
                width:calc(100% - 25px);
                overflow-x: auto;
                overflow-y: hidden;
                white-space: nowrap;
                height:40px;
                padding-left:0;
            }
            #sl-tab-container {
                height: 40px;
                width:100%;
                position: absolute;
                bottom: 0;
                margin-bottom:0;
                left:0;
                border-top:2px solid #666666;
            }

            .sl-tab-navigator {
                width:25px;
                position:absolute !important;
                right:0;
                height: 20px;
                line-height: 20px;
                text-align:center;
                font-size:14px;            
            }
            #sl-right {
                bottom: 20px;
            }
            #sl-left {
                bottom: 0;
            }
            #sl-tabs::-webkit-scrollbar {
                display: none;
            }
            #ide-body {
                margin-top: 40px;
            }

            .sl-tab-title {
                line-height:35px;
                margin:7px;
                cursor: default;
                color: ${settings.tabTextColor};
            }

            .sl-tab-temp {
                font-style: italic;
            }

            .sl-tab-favorite>.sl-tab-remove::before {
                content: "\\f004";
            }

            .sl-tab-mainfile>.sl-tab-remove::before {
                content: "\\f015" !important;
            }

            .sl-tab-active {
                border-bottom:3px solid #A93529;
                color:#eee;
            }
            .sl-tab-remove {
                text-decoration: none !important;
            }
        `);
    }

    this.setStyles();

    settings.addEventListener("themeChanged", function() {
        self.setStyles();
    });

    
    
    var tabsMowing = false;
    $(document).on("mousedown", ".sl-tab-navigator", function(event) {
        console.log("moving");
        var scrollspeed = 5;
        var right = $(event.target).is("#sl-right") || $(event.target).parent().is("#sl-right");
        tabsMowing = true;

        function accelerate() {
            scrollspeed++;
            var leftPos = $('#sl-tabs').scrollLeft();
            if (right) leftPos += scrollspeed;
            else leftPos -= scrollspeed;
            $("#sl-tabs").animate({scrollLeft: leftPos}, 50, "linear", function() {if(tabsMowing) accelerate();});
        }

        accelerate();
        return false;
    });

    $(document).mouseup(function(){
        tabsMowing = false;
        return false;
    });

    this.tabs= $("#sl-tabs");
    this.CurrentTab = 0;
    var self = this;
    this.editorListener = null;
    slext.addEventListener("FileClicked", function(data) {
        var index = self.OpenFiles.findIndex(function(File) {return File.el == data.file.el;});
        if (index == -1) {
            data.file.temporary = !data.event.shiftKey;
            data.file.favorite = false;
            data.file.mainfile = false;
            var lastindex = self.OpenFiles.length - 1;
            if ($(".sl-tab-temp").length) {
                self.OpenFiles[lastindex] = data.file;
                self.ReplaceTab(lastindex, data.file);
                if (data.event.shiftKey) {
                    $(".sl-tab").removeClass("sl-tab-temp");
                    self.UnbindEditorListener();
                }

            } else {
                self.OpenFiles.push(data.file);
                lastindex++;
                self.AddTab(data.file, !data.event.shiftKey);
                self.AddEditorListener();
            }
            self.setActive(lastindex);
            self.CurrentTab = lastindex;
        } else {
            if (self.OpenFiles[index].temporary) {
                self.OpenFiles[index].temporary = false;
                $(".sl-tab-temp").removeClass("sl-tab-temp");
            }
            self.setActive(index);
            self.CurrentTab = index;
        }
        self.updateTabNames();
    });

    slext.addEventListener("PdfClicked", updateLocationFromFile);
    slext.addEventListener("UserClicked", updateLocationFromFile);

    updateLocationFromFile(slext.getCurrentFile());
    this.tabs.children().eq(0).addClass("sl-tab-active");

    function updateLocationFromFile(file) {
        var index = self.OpenFiles.findIndex(function(File) {return File.el == file.el;});
        if (index != -1) {
            self.setActive(index);
            self.CurrentTab = index;
        } else {
            self.OpenFiles.push(file);
            self.AddTab(file);
            self.CurrentTab = self.OpenFiles.length - 1;
            self.setActive(self.OpenFiles.length - 1);
        }
    }

    $(window).keydown(function(event) {
         if (event.altKey && event.keyCode == 68) { /* d */
            event.preventDefault();
            self.FavoriteCurrentTab();
        } else if (event.altKey && event.keyCode == 77) { /* m */
            event.preventDefault();
            self.SetMainTabToCurrentTab();
        } else if(event.altKey && event.keyCode == 87) { /* w */
            event.preventDefault();
            self.RemoveTab(self.CurrentTab);
        }
    });
    $("html").on("click", ".sl-tab", function(evt) {
        if (evt.target.nodeName == "A"){
            self.RemoveTab($(".sl-tab").index($(evt.target).parent()));
            return;
        }
        var elClicked = self.OpenFiles[$(".sl-tab").index(this)].el;
        if (!$(elClicked).hasClass("ui-draggable")) {
            slext.Files = indexAllFiles();
            for (var i = 0; i < self.OpenFiles.length; i++) {
                var index = slext.Files.findIndex(function(file) {return file.path == self.OpenFiles[i].path});
                if (index != -1) {
                    self.OpenFiles[i].el = slext.Files[index].el;
                }
            }
        }
        self.OpenFiles[$(".sl-tab").index(this)].el.click();
    });
}
TabModule.prototype.RemoveTab = function(index) {
    if (this.OpenFiles[index].favorite || this.OpenFiles[index].mainfile || this.OpenFiles.length <= 1) return;
    this.OpenFiles.splice(index, 1);
    this.tabs.children().eq(index).remove();
    if (index == 0) {
        this.CurrentTab = 0;
    } else if (index <= this.CurrentTab) {
        this.CurrentTab--;
    }
    this.OpenFiles[this.CurrentTab].el.click();
}

TabModule.prototype.AddEditorListener = function() {
    var self = this;
    if (typeof self.editorListener == 'undefined' || self.editorListener == null) {
        self.editorListener = $("#editor").keydown(function(event) {
            if (!event.altKey && !event.ctrlKey && !event.shiftKey && $(".sl-tab-active").hasClass("sl-tab-temp")) {
                $(".sl-tab-active").removeClass("sl-tab-temp");
                self.UnbindEditorListener();
            }
        });   
    }
}
TabModule.prototype.UnbindEditorListener = function() {
    this.OpenFiles[$(".sl-tab").index($(".sl-tab-active"))].temporary = false;
    this.editorListener.unbind();
    this.editorListener = null;
}
TabModule.prototype.OpenFiles = [];

TabModule.prototype.FavoriteCurrentTab = function() {
    var tab = this.tabs.children().eq(this.CurrentTab);
    tab.removeClass("sl-tab-temp");
    this.OpenFiles[this.CurrentTab].temporary = false;
    if (tab.hasClass("sl-tab-favorite")) {
        tab.removeClass("sl-tab-favorite");
        this.OpenFiles[this.CurrentTab].favorite = false;
    } else {
        tab.addClass("sl-tab-favorite");
        this.OpenFiles[this.CurrentTab].favorite = true;
    }
    this.SortTabs();
}

TabModule.prototype.SetMainTabToCurrentTab = function() {
    var tab = this.tabs.children().eq(this.CurrentTab);
    tab.removeClass("sl-tab-temp");
    this.OpenFiles[this.CurrentTab].temporary = false;
    if (tab.hasClass("sl-tab-mainfile")) {
        tab.removeClass("sl-tab-mainfile");
        this.OpenFiles[this.CurrentTab].mainfile = false;
    } else {
        for (var i = 0; i < this.OpenFiles.length; i++) {
            this.OpenFiles[i].mainfile = false;
        }
        $(".sl-tab-mainfile").removeClass("sl-tab-mainfile");
        tab.addClass("sl-tab-mainfile");
        this.OpenFiles[this.CurrentTab].mainfile = true;
    }
    this.SortTabs();
}

TabModule.prototype.SortTabs = function() {
    var currentIndex = this.CurrentTab;
    for (var i = 0; i < this.OpenFiles.length; i++) {
        this.OpenFiles[i].index = i;
    }
    this.OpenFiles.sort(function(a,b) {
        if (a.temporary) return 1;
        if (b.temporary) return -1;
        if (a.mainfile) return -1;
        if (b.mainfile) return 1;
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

    for (var i = 0; i < this.OpenFiles.length; i++) {
        if (this.OpenFiles[i].index == currentIndex) this.CurrentTab = i;
        var child = this.tabs.children().eq(this.OpenFiles[i].index);
        child.attr("sort-order", i);
        
    }
    this.tabs.children().sort(function(a,b) {
        return parseInt($(a).attr("sort-order")) - parseInt($(b).attr("sort-order"));
    }).appendTo(this.tabs);
}

TabModule.prototype.AddTab = function(file, temp = false) {
    var newTab = $("<li class='sl-tab'> \
                       <span class='sl-tab-title' title='" + file.path + "'>" + 
                           file.name 
                     + "</span>\
                        <a class='sl-tab-remove fa fa-times' href='#'></a>\
                   </li>");
    if (temp) newTab.addClass("sl-tab-temp");
    this.tabs.append(newTab);
}

TabModule.prototype.ReplaceTab = function(index, file) {
    var toReplace = this.tabs.children().eq(index).find(".sl-tab-title").eq(0);

    toReplace.attr("title", file.path);
    toReplace.text(file.name);
}

TabModule.prototype.setActive = function(index) {
    $(".sl-tab").removeClass("sl-tab-active");
    this.tabs.children().eq(index).addClass("sl-tab-active");
}

TabModule.prototype.updateTabNames = function() {
    var self = this;
    $(this.tabs.children()).each(function() {
        var tabTitle = $(this).find('.sl-tab-title');
        var index = self.OpenFiles.findIndex(function(file) {return file.path == tabTitle.attr('title');});
        tabTitle.html(shortestPath(self.OpenFiles[index], self.OpenFiles));
    });
}


jQuery.fn.swapWith = function(to) {
    return this.each(function() {
        var copy_to = $(to).clone(true);
        var copy_from = $(this).clone(true);
        $(to).replaceWith(copy_from);
        $(this).replaceWith(copy_to);
    });
};

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