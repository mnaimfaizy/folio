import archiver from 'archiver';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..', '..');

function log(msg) {
  console.log(`[package-web] ${msg}`);
}

function rm(targetPath) {
  fs.rmSync(targetPath, { recursive: true, force: true });
}

function mkdir(targetPath) {
  fs.mkdirSync(targetPath, { recursive: true });
}

function copyDir(src, dst) {
  fs.cpSync(src, dst, { recursive: true });
}

function exists(p) {
  return fs.existsSync(p);
}

async function createZipFromDir({ dir, outFile }) {
  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outFile);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', resolve);
    output.on('error', reject);

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        log(`WARN: ${err.message}`);
      } else {
        reject(err);
      }
    });

    archive.on('error', reject);

    archive.pipe(output);
    archive.glob('**/*', {
      cwd: dir,
      dot: true,
      ignore: ['**/*.zip'],
    });
    archive.finalize();
  });
}

function run(command, args, { cwd }) {
  const r = spawnSync(command, args, {
    cwd,
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if ((r.status ?? 1) !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
}

const argv = process.argv.slice(2);
const shouldBuild = !argv.includes('--skip-build');
const apiUrlArgIndex = argv.findIndex((a) => a === '--api-url');
const apiUrl = apiUrlArgIndex >= 0 ? argv[apiUrlArgIndex + 1] : undefined;

if (apiUrlArgIndex >= 0 && !apiUrl) {
  console.error('[package-web] ERROR: --api-url requires a value');
  process.exit(1);
}

if (!apiUrl) {
  console.error(
    '[package-web] ERROR: --api-url is required (example: yarn package:web --api-url https://api.yourdomain.com)',
  );
  process.exit(1);
}

const distWebRoot = path.join(workspaceRoot, 'dist', 'apps', 'web');
const distWebIndex = path.join(distWebRoot, 'index.html');

const deployBase = path.join(workspaceRoot, 'dist', 'deploy');
const deployRoot = path.join(deployBase, 'folio-web');
const zipPath = path.join(deployBase, 'folio-web.zip');

const htaccessPath = path.join(deployRoot, '.htaccess');

try {
  process.env.VITE_API_URL = apiUrl;
  log(`Using VITE_API_URL=${apiUrl}`);

  if (shouldBuild) {
    log('Building web via Nx...');
    run('yarn', ['-s', 'nx', 'build', 'web'], { cwd: workspaceRoot });
  } else {
    log('Skipping build (--skip-build).');
  }

  if (!exists(distWebIndex)) {
    throw new Error(
      `Web build output not found at ${distWebIndex}. Run build first.`,
    );
  }

  log(`Preparing deploy folder: ${deployRoot}`);
  rm(deployRoot);
  mkdir(deployRoot);

  copyDir(distWebRoot, deployRoot);

  // SPA routing support for Apache/cPanel: serve index.html for unknown paths.
  // This is required for BrowserRouter deep links (refreshing /authors, etc).
  if (!exists(htaccessPath)) {
    fs.writeFileSync(
      htaccessPath,
      [
        '<IfModule mod_rewrite.c>',
        '  RewriteEngine On',
        '  RewriteBase /',
        '  RewriteRule ^index\\.html$ - [L]',
        '  RewriteCond %{REQUEST_FILENAME} -f [OR]',
        '  RewriteCond %{REQUEST_FILENAME} -d',
        '  RewriteRule ^ - [L]',
        '  RewriteRule ^ index.html [L]',
        '</IfModule>',
        '',
      ].join('\n'),
      'utf8',
    );
  }

  fs.writeFileSync(
    path.join(deployRoot, 'CPANEL_WEB.md'),
    [
      '# cPanel Web deployment (manual)',
      '',
      '- Upload the contents of this folder to your web document root (commonly `public_html/`), or to the folder used by your domain/subdomain.',
      '- This bundle includes an `.htaccess` to support SPA routing (React Router `BrowserRouter`).',
      '',
      'Notes:',
      '- If you deploy under a subfolder (not web root), you may need to configure Vite `base` so asset URLs resolve correctly.',
    ].join('\n') + '\n',
    'utf8',
  );

  log(`Creating zip: ${zipPath}`);
  rm(zipPath);
  mkdir(deployBase);
  await createZipFromDir({ dir: deployRoot, outFile: zipPath });

  log('Done.');
  log(`Deploy folder: ${deployRoot}`);
  log(`Zip archive: ${zipPath}`);
} catch (e) {
  console.error('[package-web] ERROR:', e);
  process.exit(1);
}
