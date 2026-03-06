import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..', '..');

const versionsFilePath = path.join(
  workspaceRoot,
  'docs',
  'release',
  'versions.json',
);
const mobileAppConfigPath = path.join(
  workspaceRoot,
  'apps',
  'mobile',
  'app.json',
);
const webVersionFilePath = path.join(
  workspaceRoot,
  'apps',
  'web',
  'public',
  'version.json',
);

function log(message) {
  console.log(`[release] ${message}`);
}

function fail(message) {
  console.error(`[release] ERROR: ${message}`);
  process.exit(1);
}

function run(command, args, { capture = false } = {}) {
  const result = spawnSync(command, args, {
    stdio: capture ? 'pipe' : 'inherit',
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });

  if ((result.status ?? 1) !== 0) {
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim();
    throw new Error(
      `Command failed: ${command} ${args.join(' ')}${output ? `\n${output}` : ''}`,
    );
  }

  return (result.stdout ?? '').trim();
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = {
    command,
    base: 'main',
    push: false,
    allowDirty: false,
  };

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];

    if (token === '--push') {
      options.push = true;
      continue;
    }

    if (token === '--allow-dirty') {
      options.allowDirty = true;
      continue;
    }

    if (token.startsWith('--')) {
      const key = token.slice(2);
      const value = rest[index + 1];

      if (!value || value.startsWith('--')) {
        fail(`Missing value for option ${token}`);
      }

      options[key] = value;
      index += 1;
      continue;
    }

    fail(`Unknown argument: ${token}`);
  }

  return options;
}

function isSemverStable(version) {
  return /^\d+\.\d+\.\d+$/.test(version);
}

function parseSemver(version) {
  const [major, minor, patch] = version.split('.').map(Number);
  return { major, minor, patch };
}

function semverCompare(a, b) {
  const left = parseSemver(a);
  const right = parseSemver(b);

  if (left.major !== right.major) {
    return left.major - right.major;
  }
  if (left.minor !== right.minor) {
    return left.minor - right.minor;
  }
  return left.patch - right.patch;
}

function incrementVersion(version, bump = 'patch') {
  const parsed = parseSemver(version);

  if (bump === 'major') {
    return `${parsed.major + 1}.0.0`;
  }
  if (bump === 'minor') {
    return `${parsed.major}.${parsed.minor + 1}.0`;
  }
  if (bump === 'patch') {
    return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
  }

  fail(`Invalid --bump value "${bump}". Use patch, minor, or major.`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function validateTarget(target) {
  if (target !== 'mobile' && target !== 'web') {
    fail(`Invalid --target "${target}". Use "mobile" or "web".`);
  }
}

function validateVersion(version) {
  if (!isSemverStable(version)) {
    fail(
      `Invalid --version "${version}". Use semantic version format like 1.1.1 (without the leading "v").`,
    );
  }
}

function getLatestTagVersionForTarget(target) {
  const pattern = `${target}/v*`;
  const output = run('git', ['tag', '--list', pattern], { capture: true });
  const tags = output
    .split('\n')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => ({
      tag,
      version: tag.replace(`${target}/v`, ''),
    }))
    .filter((entry) => isSemverStable(entry.version))
    .sort((a, b) => semverCompare(a.version, b.version));

  return tags.length > 0 ? tags[tags.length - 1].version : null;
}

function inferVersionFromBranch(target) {
  const branch = getCurrentBranch();
  const expectedPrefix = `${target}/v`;

  if (!branch.startsWith(expectedPrefix)) {
    fail(
      `Cannot infer version from branch ${branch}. Expected branch format ${target}/v<version>.`,
    );
  }

  const version = branch.slice(expectedPrefix.length);
  validateVersion(version);
  return version;
}

function resolveVersion(options) {
  if (options.version) {
    validateVersion(options.version);
    return options.version;
  }

  if (options.command === 'tag') {
    const inferred = inferVersionFromBranch(options.target);
    log(`Inferred version ${inferred} from current branch.`);
    return inferred;
  }

  const latest = getLatestTagVersionForTarget(options.target);
  const bump = options.bump || 'patch';

  if (!latest) {
    const initial = '1.0.0';
    log(
      `No previous ${options.target} release tag found. Using initial version ${initial}.`,
    );
    return initial;
  }

  const nextVersion = incrementVersion(latest, bump);
  log(
    `Latest ${options.target} release is v${latest}; next ${bump} version is v${nextVersion}.`,
  );
  return nextVersion;
}

function ensureCleanWorkingTree() {
  const status = run('git', ['status', '--porcelain'], { capture: true });
  if (status) {
    fail(
      'Working tree is not clean. Commit or stash changes before running release automation, or pass --allow-dirty.',
    );
  }
}

function ensureGitRefDoesNotExist(ref) {
  try {
    run('git', ['show-ref', '--verify', '--quiet', ref]);
    fail(`Ref already exists: ${ref}`);
  } catch {
    return;
  }
}

function getCurrentBranch() {
  return run('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { capture: true });
}

function printUsage() {
  console.log(`
Usage:
  yarn release:prepare -- prepare --target <mobile|web> [--version <x.y.z> | --bump patch|minor|major] [--base main] [--push] [--allow-dirty]
  yarn release:prepare -- tag --target <mobile|web> [--version <x.y.z>] [--push] [--allow-dirty]

Examples:
  yarn release:prepare -- prepare --target mobile --bump patch --push
  yarn release:prepare -- prepare --target web --version 2.4.0 --push
  yarn release:prepare -- tag --target mobile --push
`);
}

function prepareReleaseBranch({ target, version, base, push }) {
  const branchName = `${target}/v${version}`;
  const remoteBranchRef = `refs/remotes/origin/${branchName}`;
  const localBranchRef = `refs/heads/${branchName}`;

  log(`Preparing release branch ${branchName} from ${base}...`);

  run('git', ['fetch', 'origin', '--tags']);
  run('git', ['checkout', base]);
  run('git', ['pull', '--ff-only', 'origin', base]);

  ensureGitRefDoesNotExist(localBranchRef);
  ensureGitRefDoesNotExist(remoteBranchRef);

  run('git', ['checkout', '-b', branchName]);

  if (push) {
    run('git', ['push', '-u', 'origin', branchName]);
    log(`Pushed ${branchName} to origin.`);
  } else {
    log(
      `Branch ${branchName} created locally. Push when ready: git push -u origin ${branchName}`,
    );
  }
}

function ensureVersionsFile() {
  if (!fileExists(versionsFilePath)) {
    writeJson(versionsFilePath, {
      mobile: {
        currentVersion: '1.0.0',
        lastTag: null,
        lastReleaseCommit: null,
        updatedAt: null,
      },
      web: {
        currentVersion: '1.0.0',
        lastTag: null,
        lastReleaseCommit: null,
        updatedAt: null,
      },
    });
  }
}

function updateMobileVersion(version) {
  const appConfig = readJson(mobileAppConfigPath);
  if (!appConfig.expo || typeof appConfig.expo !== 'object') {
    fail(`Invalid Expo config structure in ${mobileAppConfigPath}`);
  }
  appConfig.expo.version = version;
  writeJson(mobileAppConfigPath, appConfig);
}

function updateWebVersion(version) {
  writeJson(webVersionFilePath, {
    version,
    updatedAt: new Date().toISOString(),
  });
}

function updateReleaseVersionsStore(
  target,
  version,
  releaseTag,
  releaseCommit,
) {
  ensureVersionsFile();
  const versions = readJson(versionsFilePath);

  if (!versions.mobile || !versions.web) {
    fail(`Invalid versions file structure in ${versionsFilePath}`);
  }

  versions[target] = {
    currentVersion: version,
    lastTag: releaseTag,
    lastReleaseCommit: releaseCommit,
    updatedAt: new Date().toISOString(),
  };

  writeJson(versionsFilePath, versions);
}

function createReleaseCommit(target, version, tagName) {
  log(`Updating ${target} version artifacts to ${version}...`);

  ensureVersionsFile();

  if (target === 'mobile') {
    updateMobileVersion(version);
  } else {
    updateWebVersion(version);
  }

  updateReleaseVersionsStore(target, version, tagName, null);

  const filesToStage = [versionsFilePath];
  if (target === 'mobile') {
    filesToStage.push(mobileAppConfigPath);
  } else {
    filesToStage.push(webVersionFilePath);
  }

  run('git', ['add', ...filesToStage]);

  const hasChanges = run('git', ['status', '--porcelain'], { capture: true });
  if (!hasChanges) {
    log('No version changes detected to commit.');
    return null;
  }

  const commitMessage = `chore(release): ${target} v${version}`;
  run('git', ['commit', '-m', commitMessage]);
  const commitSha = run('git', ['rev-parse', 'HEAD'], { capture: true });

  updateReleaseVersionsStore(target, version, tagName, commitSha);
  run('git', ['add', versionsFilePath]);
  const hasManifestUpdates = run('git', ['status', '--porcelain'], {
    capture: true,
  });
  if (hasManifestUpdates) {
    run('git', ['commit', '--amend', '--no-edit']);
  }

  log(`Created release commit ${commitSha} (${commitMessage}).`);
  return run('git', ['rev-parse', 'HEAD'], { capture: true });
}

function createReleaseTag({ target, version, push }) {
  const tagName = `${target}/v${version}`;
  const currentBranch = getCurrentBranch();
  const expectedBranch = `${target}/v${version}`;

  if (currentBranch !== expectedBranch) {
    fail(
      `Current branch is ${currentBranch}. Checkout ${expectedBranch} before creating tag ${tagName}.`,
    );
  }

  const localTagRef = `refs/tags/${tagName}`;

  log(`Creating release tag ${tagName}...`);

  run('git', ['fetch', 'origin', '--tags']);
  ensureGitRefDoesNotExist(localTagRef);

  createReleaseCommit(target, version, tagName);

  const message = `${target} release v${version}`;
  run('git', ['tag', '-a', tagName, '-m', message]);

  if (push) {
    run('git', ['push', 'origin', getCurrentBranch()]);
    run('git', ['push', 'origin', tagName]);
    log(`Pushed tag ${tagName} to origin.`);
  } else {
    log(
      `Tag ${tagName} created locally. Push when ready: git push origin ${tagName}`,
    );
  }
}

try {
  const options = parseArgs(process.argv.slice(2));

  if (!options.command || !['prepare', 'tag'].includes(options.command)) {
    printUsage();
    fail('Missing or invalid command. Use "prepare" or "tag".');
  }

  validateTarget(options.target);
  options.version = resolveVersion(options);

  validateVersion(options.version);

  if (!options.allowDirty) {
    ensureCleanWorkingTree();
  }

  if (options.command === 'prepare') {
    prepareReleaseBranch(options);
  } else {
    createReleaseTag(options);
  }

  log('Done.');
} catch (error) {
  fail(error.message || String(error));
}
