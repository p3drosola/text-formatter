var gulp = require('gulp');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');
var cover = require('gulp-coverage');
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');

var paths = {
  src: 'src/**/*.js',
  test: 'test/**/*.js'
};

gulp.task('coverage', function () {
  gulp.src([paths.test])
    .pipe(cover.instrument({
      pattern: [paths.src],
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
  gulp.src('./formatter.js', {read: false})
    .pipe(browserify({
      debug: gutil.env.debug
    , standalone: 'formatter' // this is the global name
    , exclude: ['underscore']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./build'))
});
