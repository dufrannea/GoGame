'use strict';

const gulp = require('gulp'),
    webpack = require('gulp-webpack'),
    tape = require('gulp-tape'),
    tapSpec = require('tap-spec');

gulp.task("build:index", () => {
    return gulp
        .src(["client/index.html"])
        .pipe(gulp.dest("./build"))
})

gulp.task("build", ["build:index"], () => {
    let wpOptions = {
        entry: {
            "main": ["./client/main.js"]
        },
        output: {
            filename: "[name].js",
            sourceMapFilename: "[name].map"
        },
        resolve: {
            // Add `.ts` and `.tsx` as a resolvable extension.
            extensions: ['', '.webpack.js', '.web.js', '.js']
        },
        devtool : "source-map"
    };

    return gulp
        .src([
            './client/**/*.*'
        ])
        .pipe(webpack(wpOptions))
        .pipe(gulp.dest('./build'));
});

gulp.task('watch', () => {
    gulp.watch(['./client/**/*.*'], ["build"]);
});

gulp.task('test',function(){
    return gulp.src('testgame.js')
               .pipe(tape({
                    reporter : tapSpec()
			    }));
});

gulp.task('watch:tests',function(){
    return gulp.watch(['testgame.js','game.js'], ["test"]);
});