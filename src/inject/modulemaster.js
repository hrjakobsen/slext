var o = new Slext();
var t = new TabModule(o);
var p = new PersistenceModule(o, t);
var c = new CompileMainModule(o, t);
var s = new SearchModule(o);