/*eslint-env node */

var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
//var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var minify = require('gulp-minify');
var useref = require('gulp-useref');

gulp.task('default', ['styles', 'concatminify', 'dist'], function() {

	//gulp.watch('sass/*.scss', ['styles']);
	//gulp.watch('*.html').on('change', browserSync.reload);

});

// gulp.task('browser-sync', function() {
// 	browserSync.init({
// 		server: {
// 			baseDir: './'
// 		}
// 	});

// 	browserSync.stream();  
// });

gulp.task('styles', function() {
	gulp.src('./src/sass/*.scss')
	.pipe(sass().on('error', sass.logError))
	.pipe(autoprefixer({browsers: ['last 2 versions'] }))
	.pipe(gulp.dest('./src/css'));
	//.pipe(browserSync.stream());
});

gulp.task('dist', function() {
    gulp.src('./src/css/*.css')
    .pipe(gulp.dest('./dist/css'));

    gulp.src('./src/*.html')
    .pipe(useref())
    .pipe(gulp.dest('./dist')); 

    gulp.src('./src/js/backbone.localStorage.js')
    .pipe(gulp.dest('./dist/js')); 

    gulp.src('./src/js/backbone-min.js')
    .pipe(gulp.dest('./dist/js')); 

    gulp.src('./src/js/underscore.js')
    .pipe(gulp.dest('./dist/js')); 
});


gulp.task('concatminify', function() {
  gulp.src('./src/js/*.js')
    .pipe(concat('main.js'))
    .pipe(minify({
        ext:{
            src:'-debug.js',
            min:'-min.js'
        }
    }))
    .pipe(gulp.dest('dist/js'));
});



