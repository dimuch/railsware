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

gulp.task("delBuildDir", async function(){
    return del([
      buildDir + "css/", buildDir + "js/"
    ])
});

gulp.task("htmlmin", async function() {
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

gulp.task('sass', async function () {
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

gulp.task('copyAssets', async function() {
    gulp.src(sourceDir + 'images/**/*').pipe(gulp.dest(buildDir + 'images'));
    gulp.src(sourceDir + 'fonts/*').pipe(gulp.dest(buildDir + 'fonts'));
});

gulp.task('icons_font_generation',  async function iconsFontGeneration() {
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

gulp.task("build", gulp.series('delBuildDir', 'copyAssets', 'icons_font_generation', 'sass', 'htmlmin'));

//watch for changes
gulp.task('default', gulp.series('build', async function(done) {
  livereload.listen({ basePath: 'build' });

  gulp.watch(sourceDir + 'sass/**/*.scss', gulp.series('sass'));

  gulp.watch(sourceDir + '*.html', gulp.series('htmlmin'));

  gulp.watch([sourceDir + 'fonts/*', sourceDir + 'images/*'], gulp.series('icons_font_generation', 'copyAssets'));

  done();
}));

gulp.task('server', gulp.series('default', async function(done) {
  return http.createServer(
    st({ path: __dirname + '/build', index: 'index.html', cache: false })
  ).listen(8080, done);
}));

