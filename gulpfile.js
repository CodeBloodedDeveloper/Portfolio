// node.js Packages / Dependencies
const gulp          = require('gulp');
const sass          = require('gulp-dart-sass');
const uglify        = require('gulp-uglify');
const rename        = require('gulp-rename');
const concat        = require('gulp-concat');
const cleanCSS      = require('gulp-clean-css');
const imageMin      = require('gulp-imagemin');
const pngQuint      = require('imagemin-pngquant'); 
const browserSync   = require('browser-sync').create();
const autoprefixer  = require('gulp-autoprefixer');
const jpgRecompress = require('imagemin-jpeg-recompress'); 
const clean         = require('gulp-clean');
const deploy        = require('gulp-gh-pages');

// Paths
var paths = {
    root: { 
        www:        './public_html'
    },
    src: {
        root:       'public_html/assets',
        html:       'public_html/*.html',
        css:        'public_html/assets/css/*.css',
        js:         'public_html/assets/js/*.js',
        vendors:    'public_html/assets/vendors/**/*.*',
        imgs:       'public_html/assets/imgs/**/*.+(png|jpg|gif|svg|jpeg|webp)',
        scss:       'public_html/assets/scss/**/*.scss'
    },
    dist: {
        root:       'public_html/dist',
        // FIXED: Output to 'dist/assets' to match HTML paths (href="assets/...")
        css:        'public_html/dist/assets/css',
        js:         'public_html/dist/assets/js',
        imgs:       'public_html/dist/assets/imgs',
        vendors:    'public_html/dist/assets/vendors'
    }
}

// Compile SCSS
gulp.task('sass', function() {
    return gulp.src(paths.src.scss)
    .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError)) 
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.src.root + '/css'))
    .pipe(browserSync.stream());
});

// Minify + Combine CSS
gulp.task('css', function() {
    return gulp.src(paths.src.css)
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(concat('style.css'))
    // REMOVED: .pipe(rename({ suffix: '.min' })) -> HTML looks for style.css
    .pipe(gulp.dest(paths.dist.css))
});

// Minify + Combine JS
gulp.task('js', function() {
    return gulp.src(paths.src.js)
    .pipe(uglify())
    .pipe(concat('johndoe.js')) // FIXED: Match the filename in index.html
    // REMOVED: .pipe(rename({ suffix: '.min' })) -> HTML looks for johndoe.js
    .pipe(gulp.dest(paths.dist.js))
    .pipe(browserSync.stream());
});

// Compress images
gulp.task('img', function(){
    return gulp.src(paths.src.imgs)
    .pipe(imageMin([
        imageMin.gifsicle(),
        imageMin.jpegtran(),
        imageMin.optipng(),
        imageMin.svgo(),
        pngQuint(),
        jpgRecompress()
    ]))
    .pipe(gulp.dest(paths.dist.imgs));
});

// Copy vendors
gulp.task('vendors', function(){
    return gulp.src(paths.src.vendors)
    .pipe(gulp.dest(paths.dist.vendors))
});

// Copy HTML
gulp.task('html', function(){
    return gulp.src(paths.src.html)
    .pipe(gulp.dest(paths.dist.root));
});

// Clean dist folder
gulp.task('clean', function () {
    return gulp.src(paths.dist.root, {read: false, allowEmpty: true})
        .pipe(clean());
});

// Build task
gulp.task('build', gulp.series('clean', 'sass', 'css', 'js', 'vendors', 'img', 'html'));

// Watch task
gulp.task('watch', function() {
    browserSync.init({
        server: {
            baseDir: paths.root.www
        } 
    })
    gulp.watch(paths.src.scss, gulp.series('sass'));
    gulp.watch(paths.src.js).on('change', browserSync.reload);
    gulp.watch(paths.src.html).on('change', browserSync.reload);
});

gulp.task('default', gulp.series('watch'));