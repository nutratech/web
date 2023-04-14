SHELL=/bin/bash

.DEFAULT_GOAL := _help

# NOTE: must put a <TAB> character and two pound "\t##" to show up in this list.  Keep it brief! IGNORE_ME
.PHONY: _help
_help:
	@grep -h "##" $(MAKEFILE_LIST) | grep -v IGNORE_ME | sed -e 's/##//' | column -t -s $$'\t'



# ---------------------------------------
# Install requirements
# ---------------------------------------

.PHONY: deps
deps:	## npm install
	npm install



# ---------------------------------------
# Lint & format
# ---------------------------------------

.PHONY: format
format:	## npm run format
	npm run format

.PHONY: lint
lint:	## npm run lint && npm run check
	npm run lint
	npm run check



# ---------------------------------------
# Build & install
# ---------------------------------------

APP_VERSION ?= $(shell cat package.json | jq -r '.version')
APP_RELEASE_DATE ?= $(shell date --iso)

.PHONY: build/prod
build/prod: clean
build/prod:	## Build the release
	npm run build
	tar cJf build.tar.xz build/
	du -h build.tar.xz

.PHONY: build/upload
build/upload:	## Upload to GitHub releases
	test -n "${APP_VERSION}"
	test -f build.tar.xz
	gh release create ${APP_VERSION} --generate-notes
	gh release upload ${APP_VERSION} build.tar.xz

PROJECT_NAME ?= web.2023
DEPLOY_URL ?= https://nutra.tk/

.PHONY: build/install-prod
build/install-prod:	## Install (on prod VPS)
	git branch --show-current
	git pull --tags
	test -n "${APP_VERSION}"
	# Download v${APP_VERSION}
	curl -sSLO https://github.com/nutratech/${PROJECT_NAME}/releases/download/${APP_VERSION}/build.tar.xz
	tar xf build.tar.xz
	rm -f build.tar.xz
	# Copy in place
	rm -rf /var/www/app/* && mv build/* /var/www/app/
	# Test live URL
	curl -fI ${DEPLOY_URL}



# ---------------------------------------
# Clean
# ---------------------------------------

CLEAN_LOCS_ROOT ?= *.tar.xz build/

.PHONY: clean
clean:	## Clean up leftover bits and stuff from build
	rm -rf ${CLEAN_LOCS_ROOT}

.PHONY: purge
purge:	## Purge package-lock.json && node_modules/
	rm -rf package-lock.json node_modules/
