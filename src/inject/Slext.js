function Slext(settings) {
    this.style = null;
    this.setStyles = function() {
        if (this.style != null) {
            this.style.remove();
        }
        this.style = insertStylerules(`
/*main layout*/
.ui-layout-container, .toolbar, .ui-layout-resizer {
    background-color:${settings.css.backgroundColor} !important;
}
.entity-name {
    color:${settings.css.fileColor} !important;
}
.entity-name:hover {
    color: ${settings.css.fileColorHover} !important;
}
   
::-webkit-scrollbar {
    width: 10px;
}
 
::-webkit-scrollbar-track {
    background: ${settings.css.scrollbarBackgroundColor};
}
 
::-webkit-scrollbar-thumb {
    background: ${settings.css.scrollbarThumbColor}; 
}

.loading-panel, .loading-screen {
    background-color: ${settings.css.loadingBackgroundColor} !important;
}
.loading-screen .container h3 {
    color:${settings.css.loadingTextColor};
}

.spelling-highlight {
    z-index: 6;
}

.sl-review-icon {
    float: left;
    height:30px;
    width:30px;
    margin:0;    
}
.toolbar .btn-full-height .sl-fill {
    fill:${settings.css.accentColor};
}
.toolbar .btn-full-height .sl-stroke {
    stroke:${settings.css.accentColor};
}
.toolbar .btn-full-height:hover .sl-fill,
.toolbar .btn-full-height.active:hover .sl-fill {
    fill:${settings.css.accentHover};
}
.toolbar .btn-full-height:hover .sl-stroke,
.toolbar .btn-full-height.active:hover .sl-stroke {
    stroke:${settings.css.accentHover};
}

.toolbar .btn-full-height.active .sl-fill {
    fill:${settings.css.accentActive};
}
.toolbar .btn-full-height.active .sl-stroke {
    stroke:${settings.css.accentActive};
}

a {
    color: ${settings.css.accentColor};
}
 
 
.text-primary {
    color: ${settings.css.accentColor}
}
 
.label-primary {
    background-color: ${settings.css.accentColor}
}
 
.bg-primary {
    color: ${settings.css.textColor};
    background-color: ${settings.css.accentColor}
}

.progress-bar {
    color: ${settings.css.textColor};
    background-color: ${settings.css.accentColor}
}
 
.btn-primary {
    color: ${settings.css.textColor};
    background-color: ${settings.css.accentColor};
    border-color: ${settings.css.accentHover}
}

.btn-primary:hover {
    background-color: ${settings.css.accentHover};
}
.btn-primary:active {
    background-color: ${settings.css.accentColor};
    color: ${settings.css.accentActive};
}
 
 
.btn-primary .badge {
    color: ${settings.css.accentColor};
    background-color: ${settings.css.textColor}
}
 
 
.btn-link {
    color: ${settings.css.accentColor};
}


/*Nav bar*/
.nav-tabs>li>a:hover {
    border-color: ${settings.css.accentColor} ${settings.css.accentColor} #ddd
}
 
 
.nav-pills>li>a {
    border: 2px solid ${settings.css.accentColor};
}
 
 
.navbar-toggle {
    border: 2px solid ${settings.css.accentColor};
}
 
 
.navbar-default .navbar-nav>li>a {
    color: ${settings.css.accentColor};
}
 
 
@media (min-width:768px) {
    .navbar-default .navbar-nav>li>a {
        border-color: ${settings.css.accentColor};
    }
}
 
.navbar-default .navbar-toggle {
    border-color: ${settings.css.accentColor};
    color: ${settings.css.accentColor}
}
 
 
@media (max-width:767px) {
    .navbar-default .navbar-nav .open .dropdown-menu>li>a {
        color: ${settings.css.accentColor}
    }
}
 
.navbar-default .navbar-link {
    color: ${settings.css.accentColor}
}




/*Extra*/
.qq-upload-list li.qq-upload-fail {
    background-color: ${settings.css.accentColor};
    color: ${settings.css.textColor}
}
 
 
tags-input .tags .tag-item .remove-button:active {
    color: ${settings.css.accentActive}
}
 
 
tags-input[disabled] .tags .tag-item .remove-button:active {
    color: ${settings.css.accentActive}
}
 
 
tags-input .autocomplete .suggestion-item.selected {
    color: ${settings.css.textColor};
    background-color: ${settings.css.accentColor}
}
 
 
ul.folders-menu>li.active {
    background-color: ${settings.css.accentColor};
}
 
 
.user_details_auto_complete .autocomplete ul>li.active {
    color: ${settings.css.textColor};
    background-color: ${settings.css.accentColor}
}
 
 
.announcements-badge {
    color: ${settings.css.textColor};
    background-color: ${settings.css.accentColor};
}

aside#file-tree ul.file-tree-list li i.fa-folder, aside#file-tree ul.file-tree-list li i.fa-folder-open {
    color: ${settings.css.accentColor}
}
 
aside#file-tree:not(.multi-selected) ul.file-tree-list li.selected>.entity>.entity-name {
    color: ${settings.css.accentColor};
    border-right: 4px solid ${settings.css.accentColor};
}
 
 
#history aside.change-list ul li.selected {
    border-left: 4px solid ${settings.css.accentColor}
}
 
 
#history aside.change-list ul li.selected .selectors .range {
    background-color: ${settings.css.accentColor}
}
 
 
.toolbar .btn-full-height {
    border-right: 1px solid #cfcfcf;
    color: ${settings.css.accentColor};
}
 
 
#left-menu form.settings .form-controls:hover {
    background-color: ${settings.css.accentColor}
}
 
 
.pdf-viewer .progress-thin .progress-bar {
    background-color: ${settings.css.accentColor}
}

.rp-toggle-hidden-input:checked+.rp-toggle-btn {
    background-color: ${settings.css.accentColor};
    border-color: ${settings.css.textColor}
}
 
 
.references-search-modal .search-results .search-result-hit.selected-search-result-hit {
    background-color: ${settings.css.accentColor};
    color: ${settings.css.textColor}
}
 
 
.plans .circle {
    text-shadow: 0 -1px 1px ${settings.css.accentHover};
    background-color: ${settings.css.accentColor};
    color: ${settings.css.textColor};
}
 
 
.recurly button.submit {
    border: 1px solid ${settings.css.accentHover};
    color: ${settings.css.textColor};
    background-color: ${settings.css.accentColor}
}
 
 
.recurly button.submit .badge {
    color: ${settings.css.accentColor};
    background-color: ${settings.css.textColor}
}
 
 
.template-thumbnail a h3 {
    color: ${settings.css.accentColor};
}
 
.searchResult h1 {
    color: ${settings.css.accentColor}
}
 
 
.payment-method-toggle-switch-selected {
    color: ${settings.css.accentColor};
}
 
.rfp-section-blockquote {
    background-color: ${settings.css.accentColor}
}
 
.rfp-cta {
    background-color: ${settings.css.accentColor};
    color: ${settings.css.textColor};
}
 
 
 
.btn-primary.disabled,
.btn-primary.disabled.active,
.btn-primary.disabled:active,
.btn-primary.disabled:focus,
.btn-primary.disabled:hover,
.btn-primary[disabled],
.btn-primary[disabled].active,
.btn-primary[disabled]:active,
.btn-primary[disabled]:focus,
.btn-primary[disabled]:hover,
fieldset[disabled] .btn-primary,
fieldset[disabled] .btn-primary.active,
fieldset[disabled] .btn-primary:active,
fieldset[disabled] .btn-primary:focus,
fieldset[disabled] .btn-primary:hover {
    background-color: ${settings.css.accentColor};
    border-color: ${settings.css.accentHover}
}
 
 
.dropdown-menu>li>a:focus,
.dropdown-menu>li>a:hover {
    color: ${settings.css.textColor};
    background-color: ${settings.css.accentColor}
}
 
 
.dropdown-menu>.active>a,
.dropdown-menu>.active>a:focus,
.dropdown-menu>.active>a:hover {
    color: ${settings.css.textColor};
    background-color: ${settings.css.accentColor}
}
 
 
.nav>li>a:focus,
.nav>li>a:hover {
    background-color: ${settings.css.accentColor};
    color: ${settings.css.textColor}
}
 
 
.nav .open>a,
.nav .open>a:focus,
.nav .open>a:hover {
    background-color: ${settings.css.accentColor};
    border-color: ${settings.css.accentColor}
}
 
 
.nav-pills>li.active>a,
.nav-pills>li.active>a:focus,
.nav-pills>li.active>a:hover {
    color: ${settings.css.textColor};
    background-color: ${settings.css.accentColor}
}
 
 
a.thumbnail.active,
a.thumbnail:focus,
a.thumbnail:hover {
    border-color: ${settings.css.accentColor}
}
 
 
aside#file-tree:not(.multi-selected) ul.file-tree-list li.selected>.entity>.entity-name i.fa,
aside#file-tree:not(.multi-selected) ul.file-tree-list li.selected>.entity>.entity-name i.fa-folder-open {
    color: ${settings.css.accentColor}
}
 
 
.toolbar .toolbar-left>a:not(.btn).active,
.toolbar .toolbar-left>a:not(.btn):active,
.toolbar .toolbar-right>a:not(.btn).active,
.toolbar .toolbar-right>a:not(.btn):active,
.toolbar>a:not(.btn).active,
.toolbar>a:not(.btn):active {
    color: ${settings.css.textColor};
    background-color: ${settings.css.accentActive};
}
 
 
.toolbar .btn-full-height.active,
.toolbar .btn-full-height:active {
    background-color: ${settings.css.accentColor};
}
 
 
#left-menu ul.nav a:active,
#left-menu ul.nav a:hover {
    background-color: ${settings.css.accentActive};
    color: ${settings.css.textColor}
}
 
 
.services h1,
.services h2,
.services h3,
.services h4 {
    color: ${settings.css.accentColor}
}
 
 
.plans .card.features i,
.plans .plans-header h1,
.plans .plans-header h2 {
    color: ${settings.css.accentColor}
}
 
 
.recurly button.submit.disabled,
.recurly button.submit.disabled.active,
.recurly button.submit.disabled:active,
.recurly button.submit.disabled:focus,
.recurly button.submit.disabled:hover,
.recurly button.submit[disabled],
.recurly button.submit[disabled].active,
.recurly button.submit[disabled]:active,
.recurly button.submit[disabled]:focus,
.recurly button.submit[disabled]:hover,
fieldset[disabled] .recurly button.submit,
fieldset[disabled] .recurly button.submit.active,
fieldset[disabled] .recurly button.submit:active,
fieldset[disabled] .recurly button.submit:focus,
fieldset[disabled] .recurly button.submit:hover {
    background-color: ${settings.css.accentColor};
    border-color: ${settings.css.accentHover}
}
 
 
.contact-suggestion-list-item:focus,
.contact-suggestion-list-item:hover {
    color: ${settings.css.textColor};
    background-color: ${settings.css.accentColor}
}
 
 
.payment-method-toggle-switch-selected:focus,
.payment-method-toggle-switch-selected:hover {
    color: ${settings.css.accentColor}
}
 
a:focus,
a:hover {
    color: ${settings.css.accentHover};
    text-decoration: underline;
}
 
.btn-link:focus,
.btn-link:hover {
    color: ${settings.css.accentHover};
}
 
.navbar-default .navbar-nav>li>a:focus,
.navbar-default .navbar-nav>li>a:hover {
    color: ${settings.css.textColor};
    background-color: ${settings.css.accentHover};
    border: 2px solid ${settings.css.accentHover}
}
 
.navbar-default .navbar-nav>.active>a,
.navbar-default .navbar-nav>.active>a:focus,
.navbar-default .navbar-nav>.active>a:hover {
    color: ${settings.css.textColor};
    background-color: ${settings.css.accentHover}
}
 
.navbar-default .navbar-toggle.active,
.navbar-default .navbar-toggle:hover {
    background-color: ${settings.css.accentHover};
    border-color: ${settings.css.accentHover};
    color: ${settings.css.textColor}
}
 
.navbar-default .navbar-nav>.open>a,
.navbar-default .navbar-nav>.open>a:focus,
.navbar-default .navbar-nav>.open>a:hover {
    background-color: ${settings.css.accentHover};
    color: ${settings.css.textColor}
}
 
.navbar-default .navbar-link:hover {
    color: ${settings.css.accentHover}
}
 
.toolbar .btn-full-height:hover {
    background-color: ${settings.css.textColor};
    color: ${settings.css.accentHover}
}
 
.label-danger {
    background-color: #99736e;
}
        `);
    }
    this.setStyles();

    settings.addEventListener("themeChanged", function() {
        self.setStyles();
    });

    var self = this;
    Dispatcher.call(this);

    this.Files = indexAllFiles();
    // watch for changes in file tree
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    var obs = new MutationObserver(function(mutations, observer) {
        if(mutations[0].addedNodes.length || mutations[0].removedNodes.length) {
            self.Files = indexAllFiles();
            self.dispatch("FileTreeChanged");
        }
    });
    let interval = setInterval(function() {
        if ($(".file-tree-inner").length != 0) {
            obs.observe( $(".file-tree-inner")[0], { childList:true, subtree:true });
            clearInterval(interval);
        }
    }, 100);

    var fileClickListener = $("html").on("click", ".entity-name.ng-isolate-scope.ui-draggable.ui-draggable-handle", function(evt) {
        var el = this;
        self.dispatch("FileClicked", {event: evt, file: newFile(el)});
    });


    $("html").on("click", "div.pdf-viewer.ng-scope, .online-user", function() {
        setTimeout(function() {
            var selected = $('.selected').find(".entity-name.ng-isolate-scope.ui-draggable.ui-draggable-handle")[0];
            self.dispatch("PdfClicked", newFile(selected));
        }, 1000);
    });

    $("html").on("click", 'a[ng-click="gotoUser(user)"]', function() {
        setTimeout(function() {
            var selected = $('.selected').find(".entity-name.ng-isolate-scope.ui-draggable.ui-draggable-handle")[0];
            self.dispatch("UserClicked", newFile(selected));
        }, 1000);
    });
    this.getCurrentFile = function() {
        return newFile($('.selected').find(".entity-name.ng-isolate-scope.ui-draggable.ui-draggable-handle")[0]);
    }
    this.isFullScreenPdf = function() {
        var pdfButton = $('li[ng-controller="PdfViewToggleController"]');
        return (pdfButton.length && pdfButton.hasClass("selected"));
    }
    this.goToFullScreenPdf = function() {
        var pdfButton = $('div[ng-click="togglePdfView()"]');
        if (pdfButton.length) {
            pdfButton.click();
        }
    }
}

Slext.prototype = new Dispatcher();

Slext.prototype.constructor = Slext;

Slext.prototype.Files = [];

function indexAllFiles() {
    var allFiles = [];

    $('file-entity > li.ng-scope').each(
        function() {
            if(isFile($(this))) {
                allFiles.push(newFile($(this).find(".entity-name.ng-isolate-scope.ui-draggable.ui-draggable-handle")[0]));
            }
        }
    );
    return allFiles;

}

function isFile(el) {
    return $(el).children('div.entity[ng-if="entity.type != \'folder\'"]').length == 1;
}

function newFile(el) {
    var file = {el: el, name: getname(el), dir: getDir(el)};
    file.path = getDir(el)+getname(el);
    return file;
}

function getname(el) {
    return $(el).find("span.ng-binding").eq(0).text().replace(" ", "");
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

function insertStylerules(style) {
    var style = $("<style type='text/css'> " + style + "</style>");
    style.appendTo("head");
    return style;
}
