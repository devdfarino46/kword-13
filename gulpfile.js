const gulp = require('gulp'); // task runner
const browserSync = require('browser-sync').create(); // server
const sass = require('gulp-sass')(require('sass')); // compile sass to css
const autoprefixer = require('gulp-autoprefixer'); // add vendor prefixes to CSS rules
const cleanCSS = require('gulp-clean-css'); // minify css
const rename = require('gulp-rename'); // rename files
const imageMin = require('gulp-imagemin'); // minify images
const webp = require('gulp-webp'); // convert images to webp
const sourceMaps = require('gulp-sourcemaps'); // generate source maps
const notify = require('gulp-notify'); // notifications
const plumber = require('gulp-plumber'); // error handling
const webpack = require('webpack-stream'); // webpack
const babel = require('gulp-babel'); // babel
const sassGlob = require('gulp-sass-glob'); // globbing for sass]
const fileInclude = require('gulp-file-include'); // file include
const fontello = require('gulp-fontello'); // fontello
const gitignoreExclude = require('gulp-gitignore'); // gitignore exclude
const path = require('path'); // path
const ghpages = require('gulp-gh-pages'); // gh-pages
const Archiver = require('adm-zip'); // archiver
const clean = require('gulp-clean'); // clean

const dirname = path.basename(__dirname);
const resultConfig = require('./result-config.json');

// Browsersync init
function _bs() {
  browserSync.init({
    // proxy: 'localhost/',
    // port: 80,
    server: './',
    open: false
  });
}

// Whatching
function _whatching() {
  gulp.watch(['html/**/*.html'], _html);
  gulp.watch('scss/**/*.scss', _sass);
  gulp.watch(['js-src/**/*.js'], _js);
  gulp.watch(['fontello/config.json'], _fontello);
}

function _html() {
  return gulp.src(['html/*.html'])
    .pipe(fileInclude({
      prefix: '@@',
      basepath: '@file',
      context: {
        class: '',
        versiontime: '',
        version: ''
      }
    }))
    .pipe(gulp.dest('.'))
    .pipe(browserSync.stream());
}

// SCSS to CSS
function _sass() {
  return gulp.src(["scss/**/*.scss"])
    .pipe(plumber({
      errorHandler: notify.onError({
        title: "SCSS Error",
        message: "Error: <%= error.message %>"
      })
    }))
    .pipe(sourceMaps.init())
    .pipe(sassGlob())
    .pipe(sass({

    }))
    .pipe(autoprefixer())
    .pipe(cleanCSS({
      compatibility: 'ie9'
    }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourceMaps.write('.'))
    .pipe(gulp.dest("css"))
    .pipe(browserSync.stream());
}

function _js() {
  return gulp.src('js-src/**/*.js')
    .pipe(plumber({
      errorHandler: notify.onError({
        title: "JS Error",
        message: "Error: <%= error.message %>"
      })
    }))
    .pipe(sourceMaps.init())
    .pipe(babel())
    .pipe(webpack(require('./webpack.config.js')))
    .pipe(sourceMaps.write('.'))
    .pipe(gulp.dest('js'))
    .pipe(browserSync.stream());
}

function _imageMin() {
  return gulp.src('img/**/*.+(png|jpeg|jpg|gif|svg)')
    .pipe(imageMin({ verbose: true }))
    .pipe(gulp.dest('img'));
}

function _webp() {
  return gulp.src('img/**/*.+(png|jpeg|jpg)')
    .pipe(webp())
    .pipe(gulp.dest('img'));
}

function _fontello() {
  return gulp.src('fontello/config.json')
    .pipe(fontello())
    .pipe(gulp.dest('fontello'))
    .pipe(browserSync.stream());
}

function _cleanResult() {
  return gulp.src(`./fl-result/${dirname}/TMDEX.zip`)
    .pipe(clean({read: false}));
}

function _resultPack() {
  return gulp.src(resultConfig.files, {base: '.'})
    .pipe(gulp.dest(`fl-result/${dirname}`));
}

function _sourcePack() {
  return gulp.src('**/*', {base: '.'})
    .pipe(gitignoreExclude())
    .pipe(gulp.dest(`fl-result/${dirname}.src`));
}

function _ziping(cb) {
  const zip = new Archiver();
  zip.addLocalFolder('./fl-result');
  zip.writeZip(`./fl-result/${dirname}/TMDEX.zip`);
  return cb();
}

function _deploy() {
  return gulp.src(`fl-result/${dirname}/**/*`)
    .pipe(ghpages());
}

function _version() {
  const date = new Date();
  const time = `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} ${date.getHours()}:${date.getMinutes()} (Minsk)`;
  return gulp.src(['html/*.html'])
    .pipe(fileInclude({
      prefix: '@@',
      basepath: '@file',
      context: {
        class: '',
        versiontime: time,
        version: date.getTime()
      }
    }))
    .pipe(gulp.dest('.'))
    .pipe(browserSync.stream());
}

exports.default = gulp.series(
  _html,
  _sass,
  _js,
  _fontello,
  gulp.parallel(
    _bs,
    _whatching
  )
);

exports.result = gulp.series(
  _version,
  _cleanResult,
  _resultPack,
  _sourcePack,
  _ziping,
  _deploy
);
exports.version = _version;
exports.ziping = _ziping;
exports.imageMin = _imageMin;
exports.webp = _webp;
exports.css = _sass;
exports.js = _js;
exports.html = _html;
exports.fontello = _fontello;