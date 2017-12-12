function PersistenceModule(slextModule, tabModule) {
	var self = this;

	$( window ).unload(function() {
	    self.SaveOpenedTabs();
	});

	loaded = false;

	slextModule.addEventListener("FilesLoaded", () => {
		if (loaded) return;
		loaded = true;
		self.ReloadTabs();
	});

	this.SaveOpenedTabs = function() {
	    var openPaths = [];
	    var tabs = $("#sl-tabs").children();
	    for (var i = 0; i < tabModule.OpenFiles.length; i++) {
	        if (!tabs.eq(i).hasClass("sl-tab-temp"))
	            openPaths.push({path: tabModule.OpenFiles[i].path, favorite: tabs.eq(i).hasClass("sl-tab-favorite"), main : tabs.eq(i).hasClass("sl-tab-mainfile")});
	    }
	    localStorage.setItem('openedFiles', JSON.stringify(openPaths));
	}

	this.ReloadTabs = function() {
		var itemString = localStorage.getItem('openedFiles');
	    var lastOpenedFiles = JSON.parse(itemString);
	    if (lastOpenedFiles != null && itemString != "") {
	        openfiles = []
	        $("#sl-tabs").empty();
	        tabModule.OpenFiles = []
	        for (var j = 0; j < lastOpenedFiles.length; j++) {
	            var index = slextModule.Files.findIndex(function(file) {return file.path == lastOpenedFiles[j].path;});
	            if (index != -1) {
	                var openIndex = tabModule.OpenFiles.findIndex(function(file) {return file.path == lastOpenedFiles[j].path});
	                if (openIndex == -1) {
	                	tabModule.OpenFiles.push(newFile(slextModule.Files[index].el));
	                	tabModule.AddTab(newFile(slextModule.Files[index].el));
	                	openIndex = tabModule.OpenFiles.length - 1;
	                }
	                    
	                if (lastOpenedFiles[j].favorite) {
	                    $(".sl-tab").last().addClass("sl-tab-favorite");
	                    tabModule.OpenFiles[openIndex].favorite = true;
	                }
	                if (lastOpenedFiles[j].main) {
	                    $("#sl-tabs").children().eq(j).addClass("sl-tab-mainfile");
	                    tabModule.OpenFiles[openIndex].mainfile = true;
	                }
	            }
	        }
            if ($("#sl-tabs").children().length) $("#sl-tabs").children().eq(0).addClass("sl-tab-active");
	        if (tabModule.OpenFiles.length > 0)$(tabModule.OpenFiles[0].el).click(); 
	    }
	    
	}

	function newFile(el) {
	    var file = {el: el, name: getname(el), dir: getDir(el)};
	    file.path = getDir(el)+getname(el);
	    return file;
	}
}
