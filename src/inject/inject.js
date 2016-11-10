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
		injectJs(chrome.extension.getURL('src/inject/injected.js'));
   }
}, 200);