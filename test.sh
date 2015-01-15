
#/bin/bash
echo "var doc = [" 
cd biosaxs
for file in `find . -name \*.js -print |  grep -v casewindow.js | grep -v graphcanvas.js | grep -v dependencies | grep -v json2.js | grep -v dygraph |  grep -v resultsummaryform.js|  grep -v caseform.js |  grep -v min | grep -v min.js | grep -v commons |  grep -v pdbviewer | grep -v graphics | grep -v dataadapter.js | grep -v shipment.js | grep -v ext-4.2.1 | grep -v ext-4.1.1`
do 
../a.out $file
done

echo "]" 

