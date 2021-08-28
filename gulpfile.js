const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const del = require('del');
const bs = require('browser-sync').create();
const argv = require('yargs').argv;

function clean() {
  return del(['./dist', '!./dist/img']);
}
function html() {
  return gulp
    .src('./src/index.html')
    .pipe(gulp.dest('./dist'))
    .pipe(bs.stream({ match: '**/*.html' }));
}
function sass() {
  return (
    gulp
      .src('./src/styles/**/*.{scss,sass}')
      .pipe($.debug())
      .pipe($.sourcemaps.init())
      .pipe($.sass())
      .pipe($.concat('styles.min.css'))
      .pipe($.if(argv.p, $.cleanCss()))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest('./dist/styles'))
      .pipe(bs.stream({ match: '**/*.css' }))
  );
}
function js() {
  return gulp
    .src('./src/js/**/*.js')
    .pipe($.sourcemaps.init())
    .pipe($.concat('script.min.js'))
    .pipe($.if(argv.p, $.terser()))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./dist/js'));
}
function img() {
  return gulp
    .src('./src/img/**/*', { since: gulp.lastRun(img) })
    // .pipe($.debug({title: 'img'}))
    .pipe($.imagemin())
    .pipe(gulp.dest('./dist/img'))
    .pipe(bs.stream({ match: '**/*.{jpg,png}' }));
}
function serve() {
  return bs.init({
    server: './dist'
  });
}
function setWatch() {
  gulp.watch('./src/styles/**/*.{sass,scss}', sass).on('all', bs.reload);
  gulp.watch('./src/js/**/*.js', js).on('all', bs.reload);
  gulp.watch('./src/img/**/*', img).on('all', bs.reload);
  gulp.watch('./src/**/*.html', html).on('all', bs.reload);
  console.log('watching files for changes...');
}
const build = gulp.series(
  clean,
  gulp.parallel(html, sass, js, img),
  gulp.parallel(serve, setWatch),
);
exports.clean = clean;
exports.html = html;
exports.js = js;
exports.sass = sass;
exports.serve = serve;
exports.img = img;
exports.setWatch = setWatch;
exports.default = build;