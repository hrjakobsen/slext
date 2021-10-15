import gulp, { series } from 'gulp'
import gulpif from 'gulp-if'
import sourcemaps from 'gulp-sourcemaps'
import gulpSass from 'gulp-sass'
import jsSass from 'sass';
import cleanCSS from 'gulp-clean-css'
import args from './lib/args'
import log from 'fancy-log';

const sass = gulpSass(jsSass);

function styles_css() {
  return gulp.src('app/styles/*.css')
    .pipe(gulpif(args.sourcemaps, sourcemaps.init()))
    .pipe(gulpif(args.production, cleanCSS()))
    .pipe(gulpif(args.sourcemaps, sourcemaps.write()))
    .pipe(gulp.dest(`dist/${args.vendor}/styles`))
}

function styles_sass() {
  return gulp.src('app/styles/*.scss')
    .pipe(gulpif(args.sourcemaps, sourcemaps.init()))
    .pipe(sass({ includePaths: ['./app'] }).on('error', function (error) {
      log('Error (' + error.plugin + '): ' + error.message)
      this.emit('end')
    }))
    .pipe(gulpif(args.production, cleanCSS()))
    .pipe(gulpif(args.sourcemaps, sourcemaps.write()))
    .pipe(gulp.dest(`dist/${args.vendor}/styles`))
}

exports.sass = styles_sass;
exports.css = styles_css;
exports.styles = gulp.parallel(styles_sass, styles_css);
