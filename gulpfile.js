let gulp = require("gulp"),
    cssnano =require("gulp-cssnano"),
    htmlmin = require('gulp-htmlmin'),
    concat = require("gulp-concat"),
    sass = require('gulp-sass'),
    del = require('del'),
    livereload = require('gulp-livereload'),
    st = require('st'),
    http = require('http');

let buildDir = 'build/';
let sourceDir = 'front/';

gulp.task('server', ['default'], function(done) {
  http.createServer(
    st({ path: __dirname + '/build', index: 'index.html', cache: false })
  ).listen(8080, done);
});

gulp.task("delBuildDir", function(){
    return del([
      buildDir + "css/", buildDir + "js/"
    ])
});

gulp.task("htmlmin", function() {
    return gulp.src([
      sourceDir + "*.html", sourceDir + "**/*.html",
      sourceDir + "!sass/*", sourceDir + "!fonts/*"
    ])
    .pipe(htmlmin({
        removeComments: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        removeTagWhitespace: true
    }).on('error', function(){htmlmin.logError}))
    .pipe(gulp.dest(buildDir))
    .pipe(livereload());
});

gulp.task('sass', function () {
  return gulp.src(sourceDir + 'sass/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(cssnano({
      compatibility: "ie9",
      zindex: false
    }))
    .pipe(concat("common.css"))
    .pipe(gulp.dest(buildDir + '/css'))
    .pipe(livereload());
});

gulp.task('copyAssets', function() {
    gulp.src(sourceDir + 'images/**/*').pipe(gulp.dest(buildDir + 'images'));
    gulp.src(sourceDir + 'fonts/*').pipe(gulp.dest(buildDir + 'fonts'));
});

gulp.task('empty_icon_file', function emptyIconFile () {
  return gulp.src(['./front/fonts/svg-for-icons-fonts/_icons.scss'])
    .pipe(gulp.dest('./front/sass/all_styles/'));
});

gulp.task('icons_font_generation', ['empty_icon_file'], function iconsFontGeneration() {
  let iconsFiles = './front/fonts/svg-for-icons-fonts/*.svg';
  let iconfontCss = require('gulp-iconfont-css');
  let iconfont = require('gulp-iconfont');

  return gulp.src([iconsFiles])
    .pipe(iconfontCss({
      fontName: 'RailsWareIcons',
      targetPath: '../../front/sass/all_styles/icons-font.scss',
      fontPath: '../fonts/',
      cssClass: 'icon'
    }))
    .pipe(iconfont({
      fontName: 'RailsWareIcons',
      normalize: true,
      prependUnicode: true,
      formats: ['svg', 'ttf', 'woff', 'eot', 'woff2']
    }))
    .pipe(gulp.dest('build/fonts'));
});

gulp.task("build", function(){
  gulp.start('delBuildDir', 'copyAssets', 'icons_font_generation', 'sass', 'htmlmin');
});


//watch for changes
gulp.task('default', ['build'], function() {
  livereload.listen({ basePath: 'build' });

  gulp.watch(sourceDir + 'sass/**/*.scss', ['sass']);

  gulp.watch(sourceDir + '*.html', ['htmlmin']);

  gulp.watch([sourceDir + 'fonts/*', sourceDir + 'images/*'], ['icons_font_generation', 'copyAssets']);
});
