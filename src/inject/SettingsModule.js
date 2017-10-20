$("body").append(`
<div id="sl-settings-container">
	<div id="sl-settings-menu">
		<a href="#" id="sl-settings-exit" class="btn"><i class="fa fa-times" aria-hidden="true"></i></a>
		<h2>Enable/Disable modules</h2>
		<ul id="sl-modules-selector">
			<li>
				<input type="checkbox" checked id="sl-module-slext" class="sl-module"><label for="option"> Slext</label>
				<ul>
					<li>
						<input type="checkbox" id="sl-module-tabs" checked class="sl-module"><label for="option"> Tabs</label>
						<ul>
							<li><input type="checkbox" id="sl-module-save" checked class="sl-module"><label for="option"> Save tabs on close</label></li>					
							<li><input type="checkbox" id="sl-module-compilemain" checked class="sl-module"><label for="option"> "Compile Main" button</label></li>					
						</ul>
					</li>
					<li><input type="checkbox" checked id="sl-module-search" class="sl-module"><label for="option"> File search</label></li>
					<li><input type="checkbox" checked id="sl-module-goto" class="sl-module"><label for="option"> Go to file feature</label></li>
					<li><input type="checkbox" checked id="sl-module-path" class="sl-module"><label for="option"> Show current path</label></li>
					<li><input type="checkbox" checked id="sl-module-hide-names" class="sl-module"><label for="option"> Hide flags of other people</label>
						<ul>
						<li><input type="checkbox" checked id="sl-module-hide-cursors" class="sl-module"><label for="option"> Hide cursors as well</label>
						</ul>
					</li>
				</ul>
			</li>
		</ul>

		<h2>ShareLaTeX Theme</h2>
		<ul class="sl-checkbox-grid">
		    <li>
		    	<input type="radio" id="sl-theme1" value="1" name="sl-theme" />
		    	<label for="sl-theme1">
		    		<span class="sl-color" style="background-color: #fff;"></span><span class="sl-color" style="background-color: #a93529;"></span><span class="sl-color" style="background-color: #a4a4a4;"></span>
		    	</label>
		    </li>
		    <li>
		    	<input type="radio" id="sl-theme2" value="2" name="sl-theme" />
		    	<label for="sl-theme2">
		    		<span class="sl-color" style="background-color: #333;"></span><span class="sl-color" style="background-color: #a93529;"></span><span class="sl-color" style="background-color: #a4a4a4;"></span>
		    	</label>
		    </li>
		    <li>
		    	<input type="radio" id="sl-theme3" value="3" name="sl-theme" />
		    	<label for="sl-theme3">
		    		<span class="sl-color" style="background-color: #002b36;"></span><span class="sl-color" style="background-color: #586e75;"></span><span class="sl-color" style="background-color: #657b83;"></span>
		    	</label>
		    </li>
		    <li>
		    	<input type="radio" id="sl-theme4" value="4" name="sl-theme" />
		    	<label for="sl-theme4">
		    		<span class="sl-color" style="background-color: #fdf6e3;"></span><span class="sl-color" style="background-color: #eee8d5;"></span><span class="sl-color" style="background-color: #93a1a1;"></span>
		    	</label>
		    </li>
		</ul>
		<a href="#" id="sl-settings-savebutton"class="btn">Save</a>

		<h2>Keyboard shortcuts</h2>
		<div id="sl-settings-keyboard-shortcuts">
			<ul>
				<li><span class="sl-keyboard-shortcut">alt-m</span> Marks current file as main document</li>
				<li><span class="sl-keyboard-shortcut">alt-d</span> Marks current tab as favorite such that it moves to the front of the tab list and cannot be closed by accident</li>
				<li><span class="sl-keyboard-shortcut">alt-p</span> Opens file-search</li>
				<li><span class="sl-keyboard-shortcut">alt-g</span> Jumps to file under cursor in editor</li>
				<li><span class="sl-keyboard-shortcut">alt-w</span> Closes current tab</li>
			</ul>
		</div>
	</div>
</div>
`);
$("header>div.toolbar-right").prepend(`
	<a href="#" id="sl-settings-button" class="btn btn-full-height" ><i class="fa fa-cog" aria-hidden="true"></i><p class="toolbar-label">SLext settings</p></a>
`);

$("#sl-settings-button").click(function() {
	$("#sl-settings-container").css("display", "block");
	closeListener = $(document).keyup(function(e) {
	  if (e.keyCode === 27) {
	  	$("#sl-settings-container").css("display", "none");
	  	closeListener.unbind();
	  }
	});
});

$("#sl-settings-exit").click(function() {
	$("#sl-settings-container").css("display", "none");
});

var closeListener;



insertStylerules(`
	#sl-settings-exit {
		position: absolute;
		top:10px;
		right: 10px;

	}

	#sl-settings-container {
		display: none;
		position: fixed;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0,0,0,0.6);
	}

	#sl-settings-menu {
		position: absolute;
		width: 50%;
		left: 25%;
		top: 5%;
		background-color: #ddd;
		border-radius: 10px;
		height: 90%;
		padding: 25px;
		overflow-y: auto;
	}

	#sl-settings-menu ul {
		list-style:none;
	}

	.sl-keyboard-shortcut {
		font-family: monospace;
	    background-color: #ccc;
	    border: 2px dashed #bbb;
	    color: #ba68c8;
	    padding: 3px;
	    border-radius: 5px;
	}

	#sl-settings-menu h2 {
		font: inherit;
	    font-size: 20px;
	    font-weight: 700;
	    margin-top:0;
	}
	#sl-settings-keyboard-shortcuts li {
	    line-height: 35px;
	}
	.sl-checkbox-grid li {
	    display: block;
	    float: left;
	    width: 25%;
	}
	.sl-checkbox-grid li input[type="radio"] {
	    height:50px;
	}
	.sl-color {
		display:inline-block;
		height:50px;
		width:25px;
	}
	.sl-color:first-child {
		border-top-left-radius: 5px;
		border-bottom-left-radius: 5px;
	}
	.sl-color:last-child {
		border-top-right-radius: 5px;
		border-bottom-right-radius: 5px;
	}
`);

$('.sl-module').change(
    function(){
    	var parentBoxes = $(this).parents("li");
		if (this.checked) {
	    	parentBoxes.each(function(index) {
	    			var box = $(this).children(".sl-module").eq(0);
	    			box.prop("checked", true);
	    	});
		} else {
			$(this).parent().find(".sl-module").each(function(index) {
				$(this).prop("checked", false);
			});
		}
    });


var settingsString = localStorage.getItem('sl-settings');
var settings = null;
if (settingsString != "" && settingsString != null) {
	settings = JSON.parse(settingsString);
	$("#sl-module-slext").prop("checked", settings.slext);
	$("#sl-module-tabs").prop("checked", settings.tabs);
	$("#sl-module-save").prop("checked", settings.save);
	$("#sl-module-compilemain").prop("checked", settings.compilemain);
	$("#sl-module-search").prop("checked", settings.search);
	$("#sl-module-goto").prop("checked", settings.goto);
	$("#sl-module-path").prop("checked", settings.path);
	$("#sl-theme" + settings.theme).prop("checked", true);

	$("#sl-module-hide-names").prop("checked", settings.hideNames);
	$("#sl-module-hide-cursors").prop("checked", settings.hideCursors);
	settings.hideNames = settings.hideNames;
} else {
	$("#sl-theme2").prop("checked", true);
}

$(document).on("click", "#sl-settings-savebutton", function () {
	var settings = {};
	settings.slext = $("#sl-module-slext").is(":checked");
	settings.tabs = $("#sl-module-tabs").is(":checked");
	settings.save = $("#sl-module-save").is(":checked");
	settings.compilemain = $("#sl-module-compilemain").is(":checked");
	settings.search = $("#sl-module-search").is(":checked");
	settings.goto = $("#sl-module-goto").is(":checked");
	settings.path = $("#sl-module-path").is(":checked");
	settings.theme = $('input[name=sl-theme]:checked').val();
	settings.hideNames = $('#sl-module-hide-names').is(":checked");
	settings.hideCursors = $('#sl-module-hide-cursors').is(":checked");

    localStorage.setItem('sl-settings', JSON.stringify(settings));

    var response = confirm("You need to reload for changes to take effect. Reload now?");
    if (response) {
    	location.reload();
    }
});


function SettingsModule() {
    Dispatcher.call(this);
    var self = this;
    this.css = {};
	this.setSettings = function(theme) {
		if (theme == 1) {
			this.css = {
				backgroundColor: "",
				fileColor: "",
				fileColorHover: "",
				scrollbarBackgroundColor: "#eee",
				scrollbarThumbColor: "#ccc",
				loadingBackgroundColor: "",
				loadingTextColor: "",
				accentColor: "#a93529",
				accentHover: "#6b221a",
				accentActive: "white",
				textColor: "",
				tabBackgroundColor: "#ccc",
				tabTextColor: "grey",
				tabBackgroundHover: "#ddd",
				activeTabTextColor: "black"
			}
		} else if (theme == 3) {
			this.css = {
				backgroundColor: "#002b36",
				fileColor: "#586e75",
				fileColorHover: "#657b83",
				scrollbarBackgroundColor: "#073642",
				scrollbarThumbColor: "#586e75",
				loadingBackgroundColor: "#002b36",
				loadingTextColor: "#657b83",
				accentColor: "#586e75",
				accentHover: "#657b83",
				accentActive: "#839496",
				textColor: "#657b83",
				tabBackgroundColor: "#073642",
				tabTextColor: "grey",
				tabBackgroundHover: "#002b36",
				activeTabTextColor: "white"
			}
		} else if (theme == 4) {
			this.css = {
				backgroundColor: "#fdf6e3",
				fileColor: "#839496",
				fileColorHover: "#93a1a1",
				scrollbarBackgroundColor: "#839496",
				scrollbarThumbColor: "#93a1a1",
				loadingBackgroundColor: "#eee8d5",
				loadingTextColor: "#93a1a1",
				accentColor: "#839496",
				accentHover: "#93a1a1",
				accentActive: "#93a1a1",
				textColor: "#839496",
				tabBackgroundColor: "#eee8d5",
				tabTextColor: "#839496",
				tabBackgroundHover: "#93a1a1",
				activeTabTextColor: "#5b6c6e"
			}
		} else { //2 or default
			this.css = {
				backgroundColor: "#333",
				fileColor: "#a4a4a4",
				fileColorHover: "#a93529",
				scrollbarBackgroundColor: "#313131",
				scrollbarThumbColor: "#535353",
				loadingBackgroundColor: "#2b2b2b",
				loadingTextColor: "white",
				accentColor: "#a93529",
				accentHover: "#6b221a",
				accentActive: "white",
				textColor: "white",
				tabBackgroundColor: "#2b2b2b",
				tabTextColor: "#666",
				tabBackgroundHover: "#333",
				activeTabTextColor: "white"
			}
		}
		self.dispatch("themeChanged");
	}	
}

SettingsModule.prototype = new Dispatcher();