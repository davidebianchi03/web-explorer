npm run build
cp -R ./dist/react ./dist/express/react
rm -R ./dist/react
cp -R ./dist/express ./build
rm -R ./dist