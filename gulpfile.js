var gulp = require('gulp');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');
var cover = require('gulp-coverage');

var paths = {
  src: 'src/**/*.js',
  test: 'test/**/*.js'
};

function test(options) {
  return function () {
    gulp.src(paths.test).pipe(mocha(options));
  };
}

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
gulp.task('test-min', function () {
  gulp.src(paths.test).pipe(mocha());
});
gulp.task('ci', ['test-min'], function () {
  gulp.watch([paths.src, paths.test], ['test-min']);
});
