peruacru.json: peruacru.kni
	./node_modules/.bin/kni peruacru.kni -j > peruacru.json

.PHONY: cordova
gh-pages: peruacru.kni
	./scripts/gh-pages.sh

.PHONY: cordova
cordova: gh-pages .tmp/icon.png .tmp/splash.png peruacru.json
	rm -rf cordova
	cordova create cordova land.then.peruacru Peruácru
	cd cordova; cordova platforms add ios --save
	git archive gh-pages | (cd cordova/platforms/ios/www; tar xv)
	cd cordova; cordova-icon --icon ../.tmp/icon.png
	cd cordova; cordova-splash --splash ../.tmp/splash.png

.PHONY: xcode
xcode:
	open cordova/platforms/ios/Peruácru.xcodeproj

.tmp/icon-pumpkin.png:
	mkdir -p .tmp
	convert 'images/formed materials/pumpkin home.png' -resize 900x900 -gravity south -background transparent -extent 900x900 .tmp/icon-pumpkin.png

.tmp/splash.png:
	mkdir -p .tmp
	./scripts/splash.bash

.tmp/icon.png: .tmp/icon-pumpkin.png .tmp/splash.png
	composite -gravity center .tmp/icon-pumpkin.png .tmp/splash.png .tmp/icon.png
