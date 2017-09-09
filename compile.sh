#!/bin/sh
set +e
uglifycss styles/*.css > min.css
echo "Minified CSS"
cd scripts/
tsc || { echo "TypeScript compile failed"; exit 1; }
echo "Compiled TypeScript"
cd ../
uglifyjs scripts/script.js > min.js
echo "Minified JavaScript"
