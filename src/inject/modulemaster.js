var options = new SettingsModule();
if (settings == null) {
	options.setSettings(2);
	var o = new Slext(options);
	var t = new TabModule(o, options);
	var p = new PersistenceModule(o, t);
	var c = new CompileMainModule(o, t);
	var s = new SearchModule(o);
	var g = new GotoFileModule(o);
	var c = new CurrentPathModule(o, options);	
} else {
	if (settings.slext) {
		var o = new Slext(options);
		options.setSettings(settings.theme || 2);
		if (settings.tabs) {
			var t = new TabModule(o, options);
			if (settings.save) new PersistenceModule(o, t);
			if (settings.compilemain) new CompileMainModule(o, t);
		}
		if (settings.search) new SearchModule(o);
		if (settings.goto) new GotoFileModule(o);
		if (settings.path) new CurrentPathModule(o, options);
	}
}
