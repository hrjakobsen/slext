import gulp from 'gulp';
import named from 'vinyl-named';
import webpack from 'webpack';
import gulpWebpack from 'webpack-stream';
import plumber from 'gulp-plumber';
import args from './lib/args';
import log from 'fancy-log';
import gulpif from 'gulp-if'

const ENV = args.production ? 'production' : 'development';

function scripts(cb) {
    return gulp
        .src(['app/scripts/*.js', 'app/scripts/*.ts'])
        .pipe(
            // We should only plumb the error handling if we are using --watch,
            // otherwise the build should fail 
            gulpif(args.watch, plumber({
                // Webpack will log the errors
                errorHandler() {}
            }))
        )
        .pipe(named())
        .pipe(
            gulpWebpack(
                {
                    devtool: args.sourcemaps ? 'inline-source-map' : false,
                    watch: args.watch,
                    plugins: [
                        new webpack.DefinePlugin({
                            'process.env.NODE_ENV': JSON.stringify(ENV),
                            'process.env.VENDOR': JSON.stringify(args.vendor)
                        })
                    ],
                    module: {
                        rules: [
                            {
                                test: /\.html$/i,
                                use: [
                                    {
                                    loader: 'raw-loader',
                                    options: {
                                        esModule: false,
                                    },
                                    },
                                ],
                            },
                            {
                                test: /\.ts$/,
                                loader: 'ts-loader',
                                exclude: /node_modules/
                            }
                        ]
                    },
                    resolve: {
                        extensions: ['.ts', '.js'],
                        modules: ['node_modules/', 'app/scripts/']
                    },
                    optimization: {
                        minimize: args.production,
                        concatenateModules: args.production
                    },
                    mode: args.production ? "production" : "development"
                },
                webpack,
                (err, stats) => {
                    cb();
                    if (err) return;
                    log(
                        "Finished 'scripts'",
                        stats.toString({
                            chunks: false,
                            colors: true,
                            cached: false,
                            children: false
                        })
                    );
                }
            )
        )
        .pipe(gulp.dest(`dist/${args.vendor}/scripts`))
}

module.exports = scripts;