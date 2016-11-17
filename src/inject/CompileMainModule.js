function CompileMainModule(slextModule, tabModule) {
	var self = this;
	$(document).on("click", 'a[ng-click="switchToFlatLayout()"]', function() {
		self.addButton();
	});
	$(document).on("click", 'a[ng-click="switchToSideBySideLayout()"]', function() {
		self.addButton();
	});

	this.addButton = function() {
		$(".log-btn").before("<a href='#' class='sl-compile-main btn btn-info'>Compile main</a>");
	}

	this.addButton();
	$(document).on("click", ".sl-compile-main", function() {
		var pdfOpen = slextModule.isFullScreenPdf();
		var currentTab = $(".sl-tab-active");
	    var mainFile = $(".sl-tab-mainfile");

	    if (mainFile.length != 1) {
	        alert("Choose a main file with alt-m");
	        return;
	    }

	    mainFile.click();
	    setTimeout(function() {
	        $("a[ng-click='recompile()']").click();
	        currentTab.click();
	        setTimeout(function() {
	        	if (pdfOpen) slextModule.goToFullScreenPdf();
	        }, 200);
	    }, 200);
	});
}

