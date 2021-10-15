import gulp from "gulp";
import args from "./lib/args";

function fonts() {
    return gulp.src("app/fonts/**/*.{woff,woff2,ttf,eot,svg}").pipe(gulp.dest(`dist/${args.vendor}/fonts`));
}

module.exports = fonts;
