const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, args, opts) {
  console.log('>', cmd, args.join(' '));
  const res = spawnSync(cmd, args, Object.assign({ stdio: 'inherit', shell: true }, opts));
  if (res.status !== 0) throw new Error(`${cmd} exited ${res.status}`);
}

const root = path.resolve(__dirname, '..');
const frontendDir = path.join(root, 'frontend');
const backendDir = path.join(root, 'backend');
const appDir = path.join(__dirname, 'app');
const destFrontend = path.join(appDir, 'frontend', 'build');
const destBackend = path.join(appDir, 'backend');

if (!fs.existsSync(appDir)) fs.mkdirSync(appDir, { recursive: true });

// Build frontend if needed
if (!fs.existsSync(path.join(frontendDir, 'build'))) {
  console.log('No frontend build found — building frontend...');
  // Use npm install (safer when package-lock.json may be missing) and then build with correct API URL
  run('npm', ['install'], { cwd: frontendDir });
  // Ensure frontend build uses relative asset paths and correct API URL for desktop
  // Use PUBLIC_URL='.' so the generated index.html references ./static/... which works with file:// URLs
  if (process.platform === 'win32') {
    run('cmd /c', [`set "REACT_APP_API_URL=http://localhost:4000" && set "PUBLIC_URL=." && npm run build`], { cwd: frontendDir });
  } else {
    run('sh', ['-c', `REACT_APP_API_URL=http://localhost:4000 PUBLIC_URL=. npm run build`], { cwd: frontendDir });
  }
}

// Copy frontend build
if (fs.existsSync(destFrontend)) fs.rmSync(destFrontend, { recursive: true, force: true });
run('xcopy', [path.join(frontendDir, 'build'), destFrontend, '/E', '/I', '/Y']);

// Copy backend (exclude node_modules)
if (fs.existsSync(destBackend)) fs.rmSync(destBackend, { recursive: true, force: true });
fs.mkdirSync(destBackend, { recursive: true });

function copyRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const srcPath = path.join(src, e.name);
    const destPath = path.join(dest, e.name);
    if (e.name === 'node_modules' || e.name === '.git') continue;
    if (e.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyRecursive(srcPath, destPath);
    } else if (e.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyRecursive(backendDir, destBackend);

// Try to install backend production deps in the copied backend folder
try {
  console.log('Installing backend production dependencies into app/backend...');
  run('npm', ['ci', '--only=production'], { cwd: destBackend });
} catch (err) {
  console.warn('Could not install backend deps in copied folder (CI step failed).\nYou can run `npm ci --only=production` inside desktop/app/backend yourself.');
}

console.log('prepare: done. App assembled at', appDir);
