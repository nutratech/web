SHELL=/bin/bash
.DEFAULT_GOAL := _help


.PHONY: _help
_help:	## Comments like this, a tab character with two pound signs "<TAB>##" will show up unless you IGNORE_ME
ifneq ($(OS),Windows_NT)
	@grep -h "##" Makefile | grep -v IGNORE_ME | sed -e 's/##//' | column -t -s $$'\t'
else
	@echo Our make _help command does not support Windows right now!
	@echo You can try using Git Bash, Linux subsystem,
	@echo  or looking at the Makefile, to see what targets it offers.
endif



# ----------------------------------------------------------------------
# Initialize & install dependencies
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
	- npx eslint --fix --ext .js,.ts,.tsx .

.PHONY: format
format: _format/prettier _format/eslint
format:	## Format w/ prettier & ESLint



# ----------------------------------------------------------------------
# Lint & test
# ----------------------------------------------------------------------

.PHONY: lint
lint:	## Lint w/ prettier & ESLint
	npx prettier --check .
	npx eslint --max-warnings 0 --ext .js,.ts,.tsx .
	npx tsc


JEST_OPT_ARGS ?= --watchAll

.PHONY: test
test:	## Run tests
	npm test -- $(JEST_OPT_ARGS) --env=jsdom --coverage

.PHONY: _test/ci
_test/ci: JEST_OPT_ARGS=
_test/ci: export CI=true
_test/ci: test



# ----------------------------------------------------------------------
# Build, run, clean
# ----------------------------------------------------------------------

.PHONY: build
build:	## Create build
ifneq ($(OS),Windows_NT)
	TSC_COMPILE_ON_ERROR=true GENERATE_SOURCEMAP=false npm run build
else
	set TSC_COMPILE_ON_ERROR=true && set GENERATE_SOURCEMAP=false && npm run build
endif


REACT_APP_SERVER_URL ?= http://localhost:20000

.PHONY: run
run:	## Run locally, env vars: REACT_APP_SERVER_URL
ifneq ($(OS),Windows_NT)
	TSC_COMPILE_ON_ERROR=true REACT_APP_SERVER_URL=$(REACT_APP_SERVER_URL) npm start
else
	set TSC_COMPILE_ON_ERROR=true && set REACT_APP_SERVER_URL=$(REACT_APP_SERVER_URL) && npm start
endif


CLEAN_DIRS ?= build coverage
CLEAN_LOCS ?= package-lock.json

.PHONY: clean
clean:	## Removes folders: build/ coverage/
ifneq ($(OS),Windows_NT)
	rm -rf $(CLEAN_DIRS)
	rm -f $(CLEAN_LOCS)
else
	:: This uses a double percent only in Makefile, single percent in cmd.exe
	for %%i in ($(CLEAN_DIRS)) do rmdir /s %%i
	for %%i in ($(CLEAN_LOCS)) do del %%i
endif


PURGE_DIRS ?= node_modules

.PHONY: purge
purge:	## Removes folders: node_modules/
ifneq ($(OS),Windows_NT)
	rm -rf $(PURGE_DIRS)
else
	for %%i in ($(PURGE_DIRS)) do rmdir /s %%i
endif



# ----------------------------------------------------------------------
# Extras
# ----------------------------------------------------------------------

.PHONY: extras/cloc
extras/cloc:	## Count lines of source code
	cloc \
	--exclude-dir=\
	node_modules,\
	build,\
	coverage,\
	.idea,\
	.vscode,\
	package-lock.json \
	--by-file-by-lang \
	.

