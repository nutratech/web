.SHELL=/bin/bash

.PHONY: lint
lint:	##@ Run linter
	pnpm run check
	pnpm run lint

.PHONY: format
format:	##@ Format code
	pnpm run format


.PHONY: build
build:	##@ Build the project
	pnpm run build
	pnpm pack --pack-destination build/

.PHONY: clean
clean:	##@ Clean build artifacts
	rm -rf build .svelte-kit .vite

.PHONY: serve
serve:	##@ Build and serve the project
	pnpm run serve || python3 -m http.server -d build

# Default environment is "dev"
VPS_USER ?= gg
ENV ?= dev
VPS ?= $(VPS_USER)@$(ENV)

# Deploy environment variables
DEPLOYS_DIR ?= /tmp/deploys
DEPLOY_TAR ?= nutra.tk-0.0.1-rc.1.tgz

.PHONY: deploy
deploy:	##@ Deploy the project
	@echo "Deploying $(ENV) to /var/www/app..."
	# Ensure temp dir exists on remote
	ssh $(VPS) 'mkdir -p $(DEPLOYS_DIR)'
	# Scp the packed tarball
	scp build/$(DEPLOY_TAR) $(VPS):$(DEPLOYS_DIR)/$(DEPLOY_TAR)
	# Extract and sync
	ssh $(VPS) 'cd $(DEPLOYS_DIR) && \
		tar -xzf $(DEPLOY_TAR) && \
		rm -rf /var/www/app/* && \
		cp -r package/build/* /var/www/app/ && \
		rm -rf package $(DEPLOY_TAR)'
	@echo "✓ Deployed UI homepage to $(ENV)."

# --- WIP SECTION ---
# TODO: add "PHONY:" tags
# ~~~~~
# # Deploy to the server
# deploy: build
# 	@echo "Deploying to /var/www/earthybites..."
# 	# Ensure the directory exists
# 	mkdir -p /var/www/earthybites
# 	# Copy the build artifacts (SvelteKit static adapter or node build)
# 	# Assuming static adapter for now as per "static svelte home page" request
# 	# If adapter-auto/node is used, we might need to copy the build directory.
# 	# For now, copying contents of web/build (standard output) to target.
# 	cp -r web/build/* /var/www/earthybites/
# 	@echo "Deployment complete."

# # VPS connection
# VPS_HOST = dev
# VPS_ADMIN = gg

# # Deploy systemd service file to VPS
# deploy/systemd:
# 	scp scripts/medusa.service $(VPS_ADMIN)@$(VPS_HOST):~/medusa.service
# 	ssh -t $(VPS_ADMIN)@$(VPS_HOST) 'sudo cp ~/medusa.service /etc/systemd/system/medusa.service && sudo systemctl daemon-reload && rm ~/medusa.service'
# 	@echo "✓ Systemd service updated on VPS"

# # Deploy nginx configuration to VPS
# deploy/nginx:
# 	scp scripts/nginx.conf $(VPS_ADMIN)@$(VPS_HOST):~/moms-website.conf
# 	# Deploy to conf.d/moms-website.conf. NOTE: User must remove conflicting block from default.conf!
# 	ssh -t $(VPS_ADMIN)@$(VPS_HOST) 'sudo mv ~/moms-website.conf /etc/nginx/conf.d/moms-website.conf && sudo nginx -t && sudo nginx -s reload'
# 	@echo "✓ Nginx configuration updated on VPS"
