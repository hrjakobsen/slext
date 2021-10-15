import gulp from 'gulp'
import log from 'fancy-log';
import zip from 'gulp-zip'
import packageDetails from '../package.json'
import args from './lib/args'

function getPackFileType() {
  switch (args.vendor) {
    case 'firefox':
      return '.xpi'
    default:
      return '.zip'
  }
}

function pack_internal() {
  let name = packageDetails.name
  let version = packageDetails.version
  let filetype = getPackFileType()
  let filename = `${name}-${version}-${args.vendor}${args.beta ? "-BETA" : ""}${filetype}`
  return gulp.src(`dist/${args.vendor}/**/*`)
    .pipe(zip(filename))
    .pipe(gulp.dest('./packages'))
    .on('end', () => {
      let distStyled = (`dist/${args.vendor}`)
      let filenameStyled = (`./packages/${filename}`)
      log(`Packed ${distStyled} to ${filenameStyled}`)
    })
}

module.exports = pack_internal;