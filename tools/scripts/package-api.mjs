import archiver from 'archiver';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..', '..');

function log(msg) {
  console.log(`[package-api] ${msg}`);
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

function copyFile(src, dst) {
  fs.copyFileSync(src, dst);
}

function exists(p) {
  return fs.existsSync(p);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n', 'utf8');
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
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if ((r.status ?? 1) !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
}

const argv = process.argv.slice(2);
const shouldBuild = !argv.includes('--skip-build');

const distApiRoot = path.join(workspaceRoot, 'dist', 'apps', 'api');
const distApiPackageJson = path.join(distApiRoot, 'package.json');

const deployBase = path.join(workspaceRoot, 'dist', 'deploy');
const deployRoot = path.join(deployBase, 'folio-api');
const zipPath = path.join(deployBase, 'folio-api.zip');

const schemaSqlSrc = path.join(
  workspaceRoot,
  'docker',
  'postgres',
  'init',
  '001_schema.sql',
);
const seedSqlSrc = path.join(
  workspaceRoot,
  'docker',
  'postgres',
  'init',
  '002_seed.sql',
);

const settingsSqlSrc = path.join(
  workspaceRoot,
  'docker',
  'postgres',
  'init',
  '003_settings.sql',
);

const prodSeedSqlSrc = path.join(
  workspaceRoot,
  'docker',
  'postgres',
  'init',
  '003_seed_production.sql',
);

try {
  if (shouldBuild) {
    log('Building api (production) via Nx...');
    run('yarn', ['-s', 'nx', 'build', 'api', '--configuration=production'], {
      cwd: workspaceRoot,
    });
  } else {
    log('Skipping build (--skip-build).');
  }

  if (!exists(distApiPackageJson)) {
    throw new Error(
      `API build output not found at ${distApiPackageJson}. Run build first.`,
    );
  }

  log(`Preparing deploy folder: ${deployRoot}`);
  rm(deployRoot);
  mkdir(deployRoot);

  copyDir(distApiRoot, deployRoot);

  // Include SQL files for manual DB setup on shared hosting.
  const sqlDir = path.join(deployRoot, 'sql');
  mkdir(sqlDir);
  if (exists(schemaSqlSrc)) {
    copyFile(schemaSqlSrc, path.join(sqlDir, '001_schema.sql'));
  }
  if (exists(seedSqlSrc)) {
    copyFile(seedSqlSrc, path.join(sqlDir, '002_seed.sql'));
  }
  if (exists(settingsSqlSrc)) {
    copyFile(settingsSqlSrc, path.join(sqlDir, '003_settings.sql'));
  }
  if (exists(prodSeedSqlSrc)) {
    copyFile(prodSeedSqlSrc, path.join(sqlDir, '003_seed_production.sql'));
  }

  // Create a cPanel-friendly package.json in the deploy folder.
  // Nx generates a minimal dependency list; we just add scripts for convenience.
  const distPkg = readJson(distApiPackageJson);

  const deployPkg = {
    name: 'folio-api',
    private: true,
    type: 'commonjs',
    main: 'index.js',
    scripts: {
      start: 'node index.js',
    },
    dependencies: distPkg.dependencies || {},
  };

  writeJson(path.join(deployRoot, 'package.json'), deployPkg);

  fs.writeFileSync(
    path.join(deployRoot, 'CPANEL_STARTUP.md'),
    [
      '# cPanel API deployment (manual)',
      '',
      '- Application Root: this folder (upload + extract here)',
      '- Startup file: `index.js`',
      '- After upload: run `npm install --omit=dev` from cPanel UI (Run NPM Install)',
      '- Then restart the Node.js app from cPanel',
      '',
      'Notes:',
      '- This bundle intentionally does not include `node_modules`.',
      '- Ensure your production environment variables are set in cPanel.',
      '- Database SQL helpers are included in `sql/` (schema + optional seed).',
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
  console.error('[package-api] ERROR:', e);
  process.exit(1);
}
