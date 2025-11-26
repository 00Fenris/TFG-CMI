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

CI build (recommended)
----------------------
To produce a Windows .exe automatically in the cloud we added a GitHub Actions workflow at `.github/workflows/build-desktop-windows.yml`.

How to get a .exe via CI:
1. Push your changes to the `main` branch (or open this repo on GitHub)
2. From the repository's Actions tab run the "Build desktop .exe (Windows)" workflow (or wait for a pushed commit)
3. When the workflow finishes, download the artifact named `desktop-windows-artifacts` which contains the built installer / portable exe under `dist/`.

This CI run avoids local Windows permission problems and will produce the final Windows artifact that you can distribute.
