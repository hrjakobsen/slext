var o = new Slext();
var t = new TabModule(o);
var p = new PersistenceModule(o, t);
var c = new CompileMainModule(o, t);
var s = new SearchModule(o);
var g = new GotoFileModule(o);
var g = new CurrentPathModule(o);