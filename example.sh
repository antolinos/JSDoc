rm output.json
echo var doc = >> output.json
./a.out `find . -name \*.js -print | grep -v graphcanvas.js | grep -v dependencies | grep -v json2.js | grep -v dygraph/ | grep -v min.js | grep -v commons |  grep -v pdbviewer | grep -v graphics` >> output.json
