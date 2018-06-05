.PHONY: build

build: build-ui build-app

build-ui:
	cd ./ui && npm run build

build-app:
	cd ./app && rm -rf public && cp -r ../ui/build public

run-app:
	cd ./app && npm start
