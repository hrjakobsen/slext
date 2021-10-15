import gulp from 'gulp'
import args from './lib/args'
import manifest from './manifest';
import {css, sass} from './styles';
import images from './images';
import fonts from './fonts';

function reload(cb) {
  // This task runs only if the
  // watch argument is present!
  if (!args.watch) return cb()

  // The watching for javascript files is done by webpack
  // Check out ./tasks/scripts.js for further info.
  gulp.watch('app/manifest.json', manifest)
  gulp.watch('app/styles/*.css', css)
  gulp.watch('app/styles/*.scss', sass)
  gulp.watch('app/images/*', images)
  gulp.watch('app/fonts/*.{woff,ttf,eot,svg}', fonts)
}

module.exports = reload