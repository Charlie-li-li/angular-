var gulp = require('gulp');
var connect = require('gulp-connect');
var less = require('gulp-less');
var rename = require('gulp-rename');
var refresh = require('gulp-refresh');
var minifyCss = require('gulp-minify-css');
var concat = require('gulp-concat');
var minifyHtml = require('gulp-minify-html');
var uglify = require('gulp-uglify');
var path = require('path');
// var jshint = require('gulp-jshint');
var exec = require('child_process').exec;
var manifest = require('gulp-manifest');
var runSequence = require('gulp-sequence');

const BASE_PATH = 'dist';

var libsPath = [
    'bower_components/angular/angular.min.js',
    'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
    'bower_components/angular-ui-grid/ui-grid.min.js',
    'bower_components/angular-ui-grid/ui-grid.min.css',
    'bower_components/angular-ui-grid/ui-grid.eot',
    'bower_components/angular-ui-grid/ui-grid.svg',
    'bower_components/angular-ui-grid/ui-grid.ttf',
    'bower_components/angular-ui-grid/ui-grid.woff',
    'bower_components/angular-ui-router/release/angular-ui-router.min.js',
    'bower_components/bootstrap/dist/**/*',
    'bower_components/iCheck/icheck.min.js',
    'bower_components/iCheck/skins/minimal/**/*',
    'bower_components/jquery/dist/jquery.min.js',
    'bower_components/oclazyload/dist/oclazyload.min.js',
    'bower_components/sockjs/sockjs.min.js',
    'bower_components/underscore/underscore-min.js',
    'bower_components/angular-cookies/angular-cookies.min.js'
];

var bootstrapLessPath = ['src/app/commons/less/theme.less'];
var styleLessPath = ['src/app/commons/less/style.less'];

var lessPath = ['src/app/commons/less/*.less'];
var manifestPath = ['src/**/*.html', 'src/**/*.js', 'src/**/*.css'];

//static-server
gulp.task('server', function () {
    connect.server({
        root: './src',
        port: 9080
    });
});

//即时刷新
gulp.task('livereload', function () {
    refresh.listen();
    var watchedPath = ['src/index.html', 'src/app/**/*', '!src/app/commons/less/*.less'];
    gulp.watch(watchedPath, function (e) {
        console.log(e.path);
        gulp.src(e.path)
            .pipe(refresh());
    });

    // gulp.watch(watchedPath,['publish']);
});

//引用库转移
gulp.task('libs', function () {
    gulp.src(libsPath, { base : 'bower_components' })
        .pipe(gulp.dest('src/libs'));
});

//LESS编译
gulp.task('less-css', function () {
    gulp.src(bootstrapLessPath)
        .pipe(less())
        .pipe(minifyCss())
        .pipe(rename('bootstrap.min.css'))
        .pipe(gulp.dest('src/app/commons/style'));
    
    gulp.src(styleLessPath)
        .pipe(less())
        .pipe(gulp.dest('src/app/commons/style'));
});

//LESS文件监控
gulp.task('less', function () {
    gulp.watch(lessPath, ['less-css']);
});



//publish libs
gulp.task('publish-libs', function () {
    gulp.src('src/libs/**/*')
    .pipe(gulp.dest('dist/libs'));
});

gulp.task('publish-html', function () {
    gulp.src('src/**/*.html')
    .pipe(minifyHtml())
    .pipe(gulp.dest('dist'));
});

var jsPath = ['src/**/*.js', '!src/libs/**/*', '!src/configs/**/*', '!src/config.js'];
gulp.task('lint', function () {
    gulp.src(jsPath)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('publish-js', function () {
    gulp.src(jsPath)
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
    
    gulp.src(["src/configs/config.release.js"])
    .pipe(rename("config.js"))
    .pipe(gulp.dest(path.join('dist')));
});

gulp.task('publish-css', function () {
    gulp.src('src/**/*.css')
    .pipe(minifyCss())
    .pipe(gulp.dest('dist'));
});

gulp.task('publish-img', function () {
    gulp.src('src/app/commons/img/**/*', { base : 'src' })
    .pipe(gulp.dest('dist'));
});

gulp.task('publish-manifest', function () {
    gulp.src('src/app.manifest', { base: 'src' })
    .pipe(gulp.dest('dist'));
});
gulp.task('pre-clean', function () {
    exec('rm -rf dist', function (err, out) {
        console.log(out);
        err && console.log(err);
    });
});

gulp.task('publish-server', function () {
    connect.server({
        root : 'dist',
        port : 80
    });
});

gulp.task('manifest', function () {
    gulp.src(manifestPath, { base: 'src' })
    .pipe(manifest({
        hash: true,
        preferOnline: true,
        network: ['*'],
        filename: 'app.manifest',
        exclude: 'app.manifest'
    }))
    .pipe(gulp.dest('src'));
});

gulp.task('default', ['libs', 'server', 'less', 'livereload']);

gulp.task('publish' , ['publish-libs', 'publish-html', 'publish-css', 'publish-js', 'publish-img', 'publish-manifest']);