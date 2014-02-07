var gulp = require('gulp');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');
var cover = require('gulp-coverage');
var browserify = require('gulp-browserify');

var paths = {
  src: 'src/**/*.js',
  test: 'test/**/*.js'
};

gulp.task('coverage', function () {
  gulp.src([paths.test])
    .pipe(cover.instrument({
      pattern: ['**/' + paths.src],
      debugDirectory: '.debug'
    }))
    .pipe(mocha({
      reporter: 'dot'
    }))
    .pipe(cover.report({
      outFile: 'coverage.html'
    }))
    .pipe(cover.enforce({}));

  gutil.log('View coverage report in coverage.html');
});

gulp.task('test', function () {
  gulp.src(paths.test).pipe(mocha());
});

gulp.task('ci', ['test'], function () {
  gulp.watch([paths.src, paths.test], ['test']);
});

gulp.task('build', function () {
  if (gutil.env.debug) {
    gutil.log(gutil.colors.green('Building with sourcemaps'));
  }
  gulp.src('./formatter.js')
    .pipe(browserify({
      insertGlobals : true
    , debug: gutil.env.debug
    }))
    .pipe(gulp.dest('./build'))
});
