const { app, BrowserWindow, dialog } = require('electron');
const path = require('path');
// We'll run the backend inside the Electron main process (require) to avoid
// spawn/exec issues when the app is packaged (no separate node binary available).
function startBackend() {
  try {
    // Ensure API listens on localhost:4000 and seeds the DB for first run
    process.env.PORT = process.env.PORT || '4000';
    process.env.SEED_DB = process.env.SEED_DB || 'true';

    const backendPath = path.resolve(__dirname, 'app', 'backend', 'src', 'index.js');
    console.log('Starting backend by requiring', backendPath);
    // require will evaluate the backend index.js (it starts the Express server)
    require(backendPath);
  } catch (err) {
    console.error('Failed to start backend in-process:', err && err.stack ? err.stack : err);
  }
}

function stopBackend() {
  // The backend runs in the same process; when Electron quits the process stops.
  // Shutting it down gracefully would require the backend to export a stop method.
  console.log('stopBackend: no-op (backend runs in-process)');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load the static frontend build if available, fallback to a helpful message
  const staticIndex = path.join(__dirname, 'app', 'frontend', 'build', 'index.html');
  win.loadFile(staticIndex).catch(async () => {
    const msg = `No frontend build found at ${staticIndex} — make sure you ran the prepare step.`;
    console.error(msg);
    await dialog.showMessageBox({ type: 'error', title: 'Missing build', message: msg });
  });

  // Open devtools automatically so you can see what's happening in the prototype
  win.webContents.openDevTools({ mode: 'detach' });
}

app.whenReady().then(() => {
  // Start backend server then open the UI
  startBackend();
  // Wait a bit for the backend to be available
  setTimeout(createWindow, 1000);

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  stopBackend();
});

// For graceful exit in dev
process.on('SIGINT', stopBackend);
process.on('SIGTERM', stopBackend);
