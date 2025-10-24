# Running the app locally

Quick commands to run the project inside the dev container or on your local machine.

Start dev server on default port (webpack dev server):

```bash
npm run start
```

Start dev server on a specific port (e.g., 3001) if 3000 is in use:

```bash
PORT=3001 npx webpack serve --mode development --port 3001 --no-open
```

Start in background (UNIX shell):

```bash
PORT=3001 npx webpack serve --mode development --port 3001 --no-open &
```

Stop the dev server (find the PID and kill it):

```bash
# find PID(s) listening on port 3001
lsof -i TCP:3001 -sTCP:LISTEN -Pn
# or
ss -ltnp | grep ':3001'
# kill by PID
kill <PID>
# force kill if needed
kill -9 <PID>
```

Run tests (Jest):

```bash
npm test
```

Notes

- The dev server will open a browser by default when `npm run start` is used. In container environments that may not be desired, so use `--no-open` as shown above.
- If port 3000 is already in use, the server will fail to start; use a different port as shown.
- The project uses webpack dev server and Tailwind CSS.
