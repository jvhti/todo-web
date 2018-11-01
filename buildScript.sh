# !/bin/bash

echo "Building Doc"
rm -rf ./doc/
jsdoc js/* sw.js -d ./doc/

echo "Building RequireJS"
r.js -o name=main out=build/main-built.js baseUrl=./js optimize=none

echo "Minifying RequireJS"
babel-minify build/main-built.js -o build/main-built.min.js

echo "Compiling SASS"
sass sass/main.sass build/css/main.css --style compressed