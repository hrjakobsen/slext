import gulp from 'gulp'
import gulpif from 'gulp-if'
import imagemin from 'gulp-imagemin'
import args from './lib/args'

function images() {
  return gulp.src('app/images/**/*')
    .pipe(gulpif(args.production, imagemin()))
    .pipe(gulp.dest(`dist/${args.vendor}/images`))
}

module.exports = images
