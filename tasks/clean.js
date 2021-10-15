import gulp from "gulp";
import del from "del";
import args from "./lib/args";

function clean(cb) {
    del.sync(`dist/${args.vendor}/**/*`);
    return cb();
}

exports.clean = clean;
