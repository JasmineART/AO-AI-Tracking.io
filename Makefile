# Simple Make tasks for local development

.PHONY: dev api compile publish test stop

# Start dev API and webpack dev server (runs in foreground)
dev:
	@echo "Starting dev API and webpack dev server (both in background)"
	@npm run serve-api &
	@PORT=3001 npx webpack serve --mode development --port 3001 --no-open &
	@echo "Dev servers started. Frontend: http://localhost:3001, API: http://localhost:4000/api/theme"

# Start only dev API
api:
	@npm run serve-api

# Compile production bundle
compile:
	@npm run build

# Publish to gh-pages (existing deploy script)
publish:
	@npm run deploy

# Run tests
test:
	npm test -- --runInBand

# Stop common dev servers (tries to kill on ports 3001 and 4000)
stop:
	@pids=`lsof -ti TCP:3001 -sTCP:LISTEN || true`; if [ -n "$$pids" ]; then kill -9 $$pids || true; fi
	@pids=`lsof -ti TCP:4000 -sTCP:LISTEN || true`; if [ -n "$$pids" ]; then kill -9 $$pids || true; fi
	@echo "Stopped servers on 3001 and 4000"
