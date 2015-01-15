rm output.json
echo var doc = >> output.json
./a.out `find . -name \*.js -print | grep -v experimentgrid.js  | grep -v casewindow.js | grep -v macromoleculegrid.js | grep -v specimengrid.js | grep -v resultsassemblygrid.js | grep -v graphcanvas.js | grep -v dependencies | grep -v json2.js | grep -v dygraph/ | grep -v bufferform.js | grep -v resultsummaryform.js| grep -v experiment.js | grep -v caseform.js |  grep -v experimentheaderform.js | grep -v min | grep -v min.js | grep -v commons |  grep -v pdbviewer | grep -v graphics | grep -v dataadapter.js | grep -v shipment.js` >> output.json

