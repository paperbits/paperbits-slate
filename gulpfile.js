var gulp = require("gulp");
var typescript = require("typescript");
var typescriptCompiler = require("gulp-typescript");
var sourcemaps = require("gulp-sourcemaps");

function handleError(error) {
    console.error("ERROR");
    console.error(error.toString());
    this.emit("end");
}

gulp.task("typescript", function () {
    var typescriptProject = typescriptCompiler.createProject("tsconfig.json", {
        typescript: typescript
    });

    var tsResult = typescriptProject
        .src()
        .pipe(typescriptProject())

    return tsResult
        .js
        .pipe(gulp.dest("../paperbits-dev/node_modules/@paperbits/slate"));
});

gulp.task("watch", function () {
    gulp.watch(["src/**/*.ts", "src/**/*.tsx"], ["typescript"]).on("error", handleError);
});

gulp.task("default", ["typescript", "watch"]);