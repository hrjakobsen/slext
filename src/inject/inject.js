function injectJs(link, callback) {
var scr = document.createElement('script');
scr.type="text/javascript";
scr.src=chrome.extension.getURL(link);
scr.onload = callback || null;
document.getElementsByTagName('head')[0].appendChild(scr)
//document.body.appendChild(scr);
}


function loadscripts(scripts, callback) {
	var toload = scripts.length;
	var loaded = 0;
	for (var i = 0; i < scripts.length; i++) {
		injectJs(scripts[i], function() {
			if (++loaded == toload) callback();
		});
	}
}

var timer = setInterval(function() {
	if ($('div[ng-show="state.loading"]').hasClass("ng-hide")) {
		//run some other function 
		clearInterval(timer);
		
		/*var fragment = create('<div id="sl-loadscreen"><div id="sl-loadingicon">SLext is loading<br><i class="fa fa-cogs" aria-hidden="true"></i></div></div>');
		document.body.insertBefore(fragment, document.body.childNodes[0]);
		*/
		/*injectJs(chrome.extension.getURL('src/inject/Slext.js'));
		injectJs(chrome.extension.getURL('src/inject/TabModule.js'));
		injectJs(chrome.extension.getURL('src/inject/SearchModule.js'));
		injectJs(chrome.extension.getURL('src/inject/PersistenceModule.js'));
		injectJs(chrome.extension.getURL('src/inject/CompileMainModule.js'));
		injectJs(chrome.extension.getURL('src/inject/GotoFileModule.js'));
		injectJs(chrome.extension.getURL('src/inject/CurrentPathModule.js'));
		injectJs(chrome.extension.getURL('src/inject/SettingsModule.js'));
		injectJs(chrome.extension.getURL('src/inject/modulemaster.js'));*/

		loadscripts([
				'src/inject/Dispatcher.js',
				'src/inject/Slext.js',
				'src/inject/TabModule.js',
				'src/inject/SearchModule.js',
				'src/inject/PersistenceModule.js',
				'src/inject/CompileMainModule.js',
				'src/inject/GotoFileModule.js',
				'src/inject/CurrentPathModule.js',
				'src/inject/SettingsModule.js'
			], function() {
				injectJs('src/inject/modulemaster.js');
			});
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
