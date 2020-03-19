// Sass configuration
var gulp = require("gulp");
var sass = require("gulp-sass");

gulp.task("sass", function(cb) {
  gulp
    .src(["styles/**/*.scss"])
    .pipe(sass())
    .pipe(
      gulp.dest(function(f) {
        return f.base;
      })
    )
    .pipe(gulp.dest("./")); // output to theme root
  cb();
});

gulp.task(
  "default",
  gulp.series("sass", function(cb) {
    gulp.watch(["styles/**/*.scss"], gulp.series("sass"));
    cb();
  })
);
