SHELL=/bin/bash
.DEFAULT_GOAL := _help

.PHONY: _help
_help:	## Comments like this, a tab character with two pound signs "<TAB>##" will show up unless you IGNORE_ME
ifeq ($(OS),Windows_NT)
	@echo Our Makefile _help command does not support Windows right now!
	@echo You can view the Makefile to see the targets, they should work for you.
else
	@grep -h "##" $(MAKEFILE_LIST) | grep -v IGNORE_ME | sed -e 's/##//' | column -t -s $$'\t'
endif


# ----------------------------------------------------------------------
# Init & deps
# ----------------------------------------------------------------------
.PHONY: deps
deps:	## Run npm install
	npm install


# ----------------------------------------------------------------------
# Format
# ----------------------------------------------------------------------

.PHONY: _format/prettier
_format/prettier:
	npx prettier --write .

.PHONY: _format/eslint
_format/eslint:
	- npx eslint --fix --ext .ts,.tsx .

.PHONY: format
format: _format/prettier _format/eslint
format:	## Format w/ prettier & ESLint


# ----------------------------------------------------------------------
# Lint & test
# ----------------------------------------------------------------------

.PHONY: lint
lint:	## Lint w/ prettier & ESLint
	npx prettier --check .
	npx eslint --max-warnings 0 --ext .ts,.tsx .

.PHONY: _test/ci
_test/ci:
_test/ci: JEST_OPT_ARGS=
_test/ci: export CI=true
_test/ci: test

JEST_OPT_ARGS ?= --watchAll
.PHONY: test
test:	## Run tests
	npm test -- $(JEST_OPT_ARGS) --env=jsdom --coverage


# ----------------------------------------------------------------------
# Build, run, clean
# ----------------------------------------------------------------------
.PHONY: build
build:	## Create build
ifeq ($(OS),Windows_NT)
	set GENERATE_SOURCEMAP=false && npm run build
else
	GENERATE_SOURCEMAP=false npm run build
endif

REACT_APP_SERVER_URL ?= http://localhost:20000
.PHONY: run
run:	## Run locally, env vars: REACT_APP_SERVER_URL
ifeq ($(OS),Windows_NT)
	set REACT_APP_SERVER_URL=$(REACT_APP_SERVER_URL) && npm start
else
	REACT_APP_SERVER_URL=$(REACT_APP_SERVER_URL) npm start
endif

.PHONY: clean
clean:	## Removes node_modules/
ifeq ($(OS),Windows_NT)
	rmdir /s node_modules
	del package-lock.json
else
	rm -rf node_modules/
	rm -f package-lock.json
endif



# ----------------------------------------------------------------------
# Extras
# ----------------------------------------------------------------------
.PHONY: extras/cloc
extras/cloc:	## Count lines of source code
	cloc \
	--exclude-dir=\
	node_modules,\
	coverage,\
	.idea,\
	.vscode,\
	package-lock.json \
	--by-file-by-lang \
	.
