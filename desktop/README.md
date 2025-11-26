# TFG-CMI Desktop prototype

This folder contains an Electron prototype which:  
- starts the backend Node server (bundled under `app/backend`)  
- loads the built frontend (under `app/frontend/build`) into an Electron BrowserWindow  

How to produce a Windows .exe (on Windows machine):

1. From project root, install dev deps and prepare the app:

```powershell
cd desktop
npm ci
npm run prepare-app
```

2. Start the desktop app for testing:

```powershell
npm run start
```

3. Create a distributable Windows build (.exe) using electron-builder (this will create `dist/`):

```powershell
npm run package
```

Notes:
- `prepare-app` copies the `frontend/build` and `backend` folders into `desktop/app` and attempts to install the backend production dependencies.
- The packaged exe will include the backend and the static frontend; the Electron main process spawns the bundled backend when the app starts.
