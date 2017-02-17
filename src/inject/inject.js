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

var bgContainer = $(".loading-screen h3");

possibleIcons = [
	'SLext128',
	'bowl',
	'cone',
	'feather',
	'fez',
	'pinkhat'
];

bgContainer.css("background-image", "url('" + chrome.extension.getURL('src/icons/' + possibleIcons[Math.floor(Math.random()*possibleIcons.length)] + ".png") + "')");

var timer = setInterval(function() {
	if ($('div[ng-show="state.loading"]').hasClass("ng-hide")) {
		//run some other function 
		clearInterval(timer);
		
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
