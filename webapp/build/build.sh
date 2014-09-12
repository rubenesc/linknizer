
echo ""
echo "building webapp ..."

rm -rf ../../dist
node r.js -o app.build.js 
cd ../../dist
mv scripts/vendor/requirejs/require.js require.js
rm -rf scripts/vendor/* build scripts/views scripts/models scripts/collections build.txt
mkdir scripts/vendor/requirejs && mv require.js scripts/vendor/requirejs/require.js
mv css/style.css style.css && rm -rf css/* && mv style.css css/style.css

echo "building webapp ... done "
