function injectJs(link) {
var scr = document.createElement('script');
scr.type="text/javascript";
scr.src=link;
document.getElementsByTagName('head')[0].appendChild(scr)
//document.body.appendChild(scr);
}
var timer = setInterval(function() {
	if ($('div[ng-show="state.loading"]').hasClass("ng-hide")) {
		//run some other function 
		clearInterval(timer);
		
		/*var fragment = create('<div id="sl-loadscreen"><div id="sl-loadingicon">SLext is loading<br><i class="fa fa-cogs" aria-hidden="true"></i></div></div>');
		document.body.insertBefore(fragment, document.body.childNodes[0]);
		*/
		injectJs(chrome.extension.getURL('src/inject/Slext.js'));
		injectJs(chrome.extension.getURL('src/inject/TabModule.js'));
		injectJs(chrome.extension.getURL('src/inject/SearchModule.js'));
		injectJs(chrome.extension.getURL('src/inject/PersistenceModule.js'));
		injectJs(chrome.extension.getURL('src/inject/CompileMainModule.js'));
		injectJs(chrome.extension.getURL('src/inject/GotoFileModule.js'));
		injectJs(chrome.extension.getURL('src/inject/modulemaster.js'));
	}
}, 200);


function create(htmlStr) {
    var frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
    return frag;
}
