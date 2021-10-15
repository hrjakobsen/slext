import gulp from "gulp";
import reload from "./tasks/reload";
import clean from "./tasks/clean";
import manifest from "./tasks/manifest";
import scripts from "./tasks/scripts";
import { styles } from "./tasks/styles";
import images from "./tasks/images";
import fonts from "./tasks/fonts";
import pack_internal from "./tasks/pack";

const build = gulp.series(clean, gulp.parallel(manifest, scripts, styles, images, fonts), reload);

exports.build = build;

exports.default = build;

exports.pack = gulp.series(build, pack_internal);
