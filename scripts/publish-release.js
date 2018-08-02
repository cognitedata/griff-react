#!/usr/bin/env node

const shell = require('shelljs');
const semver = require('semver');
const pkg = require('../package.json');

// Abort on any shell error.
shell.set('-e');

// See which versions have already been published.}

function getPublishedVersions() {
  const { name } = pkg;
  const cmd = `yarn info ${name} versions --json`;
  const result = shell.exec(cmd, {
    silent: true,
    shell: '/bin/bash',
  });
  if (result.code !== 0) {
    console.error(`Unable to fetch versions for ${name}`);
    console.log(result.stdout);
    console.error(result.stderr);
    process.exit(result.code);
  }
  try {
    return JSON.parse(result.stdout).data;
  } catch (e) {
    return [];
  }
}

function findVersionToBump(currentVersion, versions) {
  const current = {
    major: semver.major(currentVersion),
    minor: semver.minor(currentVersion),
    patch: semver.patch(currentVersion),
  };
  const valid = (versions || getPublishedVersions())
    .filter(v => semver.major(v) === current.major)
    .filter(v => semver.minor(v) === current.minor)
    .sort((a, b) => semver.patch(b) - semver.patch(a))
    .sort(
      (a, b) =>
        (semver.prerelease(b) || [semver.patch(b)])[0] -
        (semver.prerelease(a) || [semver.patch(a)])[0]
    );
  return valid.length ? valid[0] : currentVersion;
}

const publishedVersion = findVersionToBump(pkg.version);

// Calculate the new version.
const newVersion = semver.prerelease(publishedVersion)
  ? semver.inc(publishedVersion, 'prerelease')
  : semver.inc(publishedVersion, 'patch');

// Publish a new release with this version.
shell.exec(`yarn publish --new-version "${newVersion}"`);

// Push the version tag to GitHub.
shell.exec('git push origin --tags');
