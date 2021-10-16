import gulp from "gulp";
import log from "fancy-log";
import jsonTransform from "gulp-json-transform";
import plumber from "gulp-plumber";
import applyBrowserPrefixesFor from "./lib/applyBrowserPrefixesFor";
import args from "./lib/args";

function manifest() {
    return gulp
        .src("app/manifest.json")
        .pipe(
            plumber({
                errorHandler: (error) => {
                    if (error) {
                        log("manifest: Invalid manifest.json");
                    }
                },
            })
        )
        .pipe(jsonTransform(applyBrowserPrefixesFor(args.vendor), 2 /* whitespace */))
        .pipe(
            jsonTransform(function (data, file) {
                if (args.beta) {
                    data.name += " BETA";
                    data.short_name += " BETA";
                }
                return data;
            })
        )
        .pipe(gulp.dest(`dist/${args.vendor}`));
}

module.exports = manifest;
