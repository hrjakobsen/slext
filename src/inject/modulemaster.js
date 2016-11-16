var o = new Slext();
var t = new TabModule(o);
var p = new PersistenceModule(o, t);
var c = new CompileMainModule(t);
var s = new SearchModule(o);