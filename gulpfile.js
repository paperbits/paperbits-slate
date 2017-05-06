var gulp = require("gulp");
var typescript = require("typescript");
var typescriptCompiler = require("gulp-typescript");
var sourcemaps = require("gulp-sourcemaps");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var tsify = require("tsify");

function handleError(error) {
    console.error("ERROR");
    console.error(error.toString());
    this.emit("end");
}

gulp.task("typescript", function () {
    var typescriptProject = typescriptCompiler.createProject("tsconfig.json", {
        typescript: typescript
    });

    return browserify({ debug: true, entries: ["src/index.ts"] })
        .plugin(tsify, { typescript: require("typescript") })
        .bundle()
        .on("error", handleError)
        .pipe(source("build.dev.js"))
        .pipe(gulp.dest("./src/dist"));
});

gulp.task("watch", function () {
    gulp.watch(["src/**/*.ts", "src/**/*.tsx"], ["typescript"]).on("error", handleError);
});


gulp.task("default", ["typescript", "watch"]);