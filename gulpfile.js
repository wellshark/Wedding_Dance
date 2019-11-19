var gulp = require('gulp'),
    cleanCSS = require('gulp-clean-css'),
    autoprefixer = require('gulp-autoprefixer'),
    imagemin = require('gulp-imagemin'),
    JSminify = require('gulp-minify'),
    concat = require('gulp-concat'),
    useref = require('gulp-useref'),
    browserSync = require('browser-sync').create(),
    cache = require('gulp-cache'),
    del = require('del'),
    sass = require('gulp-sass'),
    iconfont    =   require( 'gulp-iconfont' ),
    iconfontCss =   require( 'gulp-iconfont-css' );

sass.compiler = require('node-sass');

gulp.task('scss', function () {
    return gulp.src('app/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('app/css'));
});


gulp.task('clean', function (callback) {
    del('dist');
    return cache.clearAll(callback);
});

gulp.task('not_cached_image_min', function () {
    return gulp.src('app/assets/img/**/*.+(png|jpg|jpeg|gif|svg)')
    // кэширование изображений, прошедших через imagemin
        .pipe(cache(imagemin()))
        .pipe(gulp.dest('dist/assets/img'))
});

gulp.task('export', function () {
    return gulp.src('app/assets/fonts/**/*')
        .pipe(gulp.dest('dist/assets/fonts'))
});

// Static Server + watching css/js/html files
gulp.task('server', function () {

    browserSync.init({
        server: "app/"
    });

    gulp.watch('app/scss/**/*.scss',  gulp.series('scss'));

    gulp.watch("app/css/*.css", function () {
        return gulp.src("app/css/*.css").pipe(browserSync.stream());
    });
    gulp.watch("app/js/*.js", function () {
        return gulp.src("app/js/*.js").pipe(browserSync.reload());
    });
    gulp.watch("app/*.html").on('change', browserSync.reload);
});

gulp.task('compress_js', function () {
    return gulp.src(['app/js/*.js'])
        .pipe(JSminify({
            ext: {
                min: '.js'
            }, noSource: true
        }))
        .pipe(concat('main.min.js'))
        .pipe(gulp.dest('dist/js'))
});

gulp.task('html_rebuild', function () {
    return gulp.src('app/*.html')
        .pipe(useref())
        .pipe(gulp.dest('dist'));
});

gulp.task('image_min', function () {
    return gulp.src('app/assets/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/assets/img'))
});

gulp.task('minCSS', function () {
    return gulp.src('app/css/**/*.css')
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(gulp.dest('dist/css'));
});

// icon fonts
var fontName = 'icons';

// add svg icons to the folder "icons" and use 'iconfont' task for generating icon font
gulp.task( 'iconfont', async () => {
    gulp.src( 'app/assets/icons/*.svg' )
    .pipe( iconfontCss( {
        // где будет наш scss файл
        targetPath   : '../../scss/base/_icons.scss',
        // пути подлючения шрифтов в _icons.scss
        fontPath     : '../../assets/fonts/',
        fontName    : fontName

    } ) )
    .pipe( iconfont( {
        fontName    : fontName,
        formats     : [ 'svg', 'ttf', 'eot', 'woff', 'woff2' ],
        normalize   : true,
        fontHeight  : 1001
    } ) )
    .pipe( gulp.dest( 'app/assets/fonts' ) )
});




gulp.task('build', gulp.series('minCSS', 'compress_js', 'not_cached_image_min', 'html_rebuild', 'export'));
gulp.task('default', gulp.series('scss', 'server'));