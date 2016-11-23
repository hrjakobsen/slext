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
				</ul>
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
	<a href="#" id="sl-settings-button" class="btn btn-full-height" >SLext settings <i class="fa fa-cog" aria-hidden="true"></i></a>
`);

$("#sl-settings-button").click(function() {
	$("#sl-settings-container").css("display", "block");
});

$("#sl-settings-exit").click(function() {
	$("#sl-settings-container").css("display", "none");
});

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

    localStorage.setItem('sl-settings', JSON.stringify(settings));

    var response = confirm("You need to reload for changes to take effect. Reload now?");
    if (response) {
    	location.reload();
    }
});

var options = new SettingsModule();
if (settings == null) {
	var o = new Slext(options);
	var t = new TabModule(o, options);
	var p = new PersistenceModule(o, t);
	var c = new CompileMainModule(o, t);
	var s = new SearchModule(o);
	var g = new GotoFileModule(o);
	var c = new CurrentPathModule(o);	
} else {
	if (settings.slext) {
		var o = new Slext(options);
		if (settings.tabs) {
			var t = new TabModule(o, options);
			if (settings.save) new PersistenceModule(o, t);
			if (settings.compilemain) new CompileMainModule(o, t);
		}
		if (settings.search) new SearchModule(o);
		if (settings.goto) new GotoFileModule(o);
		if (settings.path) new CurrentPathModule(o);
	}
}
