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

var bgContainer = $(".loading-screen-lion");

possibleIcons = [
	'SLext128',
	'bowl',
	'cone',
	'feather',
	'fez',
	'pinkhat'
];

//bgContainer.css("background-image", "url('" + chrome.extension.getURL('src/icons/' + possibleIcons[Math.floor(Math.random()*possibleIcons.length)] + ".png") + "')");
var timer = setInterval(function() {
	console.log("Checking");
	if (!/^.*sharelatex\.com\/project\/\S+$/.test(window.location.href)) return;
	if ($(".loading-screen-lion").length) return;
	//run some other function 
	clearInterval(timer);
	var icon = $(".review-icon");
	icon.addClass("sl-review-icon");
	icon.removeClass('review-icon');
	icon.html(`<?xml version="1.0" encoding="UTF-8" standalone="no"?><svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" height="30" width="30" version="1.1" id="svg2"><metadata id="metadata8"><rdf:RDF><cc:Work rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" /><dc:title></dc:title></cc:Work></rdf:RDF></metadata><defs id="defs6" /><g id="g4282"><g id="g4173"><g id="g4181"><path class="sl-stroke" style="fill:transparent;stroke-width:2.0999999;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" d="m 18.876156,7.484234 c 0,0 -3.468066,-1.8637809 -7.685292,-1.5505413 C 8.0132404,6.1697145 -3.0336679,11.394295 5.7302615,18.540268 l 0.1092512,3.602211" id="path3340" /><path class="sl-fill" style="fill-rule:evenodd;stroke:#000000;stroke-width:0;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1;stroke-miterlimit:4;stroke-dasharray:none;fill-opacity:1" d="m 4.7669492,22.094809 -1.882945,1.716102 2.7648306,0 1.2632415,-1.263242 -0.025358,-0.438294 -2.1328125,-0.01953" id="path4142" /><text class="sl-fill" xml:space="preserve" style="font-style:normal;font-weight:normal;font-size:40px;line-height:82.00000525%;font-family:sans-serif;letter-spacing:0px;word-spacing:0px;stroke-width:1px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1;" x="10.606601" y="20.2174" id="text4144"><tspan id="tspan4146" x="10.606601" y="20.2174" style="font-style:italic;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:12.5px;line-height:81.99999928%;font-family:sans-serif;-inkscape-font-specification:'sans-serif Italic';">A<tspan style="font-style:normal;font-variant:normal;font-weight:normal;font-stretch:normal;font-size:12.5px;font-family:sans-serif;-inkscape-font-specification:sans-serif;" id="tspan4167">b</tspan></tspan></text><rect class="sl-fill" style="stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" id="rect4171" width="18.656248" height="1.0156235" x="9.140626" y="16.875" /></g></g><circle class="sl-fill" style="stroke-width:0;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" id="path4254" cx="14.460938" cy="20.507812" r="0.6640625" /></g></svg>`);

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
	}, 
200);


function create(htmlStr) {
    var frag = document.createDocumentFragment(),
        temp = document.createElement('div');
    temp.innerHTML = htmlStr;
    while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
    }
    return frag;
}
