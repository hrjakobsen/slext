import gulp from 'gulp'
import del from 'del'
import args from './lib/args'

function clean(cb) {
  del(`dist/${args.vendor}/**/*`);
  return cb();
}

module.exports = clean
