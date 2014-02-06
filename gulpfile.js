var gulp = require('gulp');
var mocha = require('gulp-mocha');
var cover = require('gulp-coverage');


gulp.task('coverage', function () {
  gulp.src(['test/**/*.js'])
    .pipe(cover.instrument({
      pattern: ['**/src/**/*.js'],
      debugDirectory: '.debug'
    }))
    .pipe(mocha({
      reporter: 'spec'
    }))
    .pipe(cover.report({
      outFile: 'coverage.html'
    }))
    .pipe(cover.enforce({}));
});

gulp.task('test', function () {
  gulp.src('test/**/*.js').pipe(mocha({reporter: 'spec'}));
});


gulp.task('ci', ['test'], function () {
  gulp.watch(['src/**/*.js', 'test/**/*.js'], ['test']);
});
