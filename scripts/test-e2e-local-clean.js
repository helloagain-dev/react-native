/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

/*
 * This script, paired with test-e2e-local.js, is the full suite of
 * tooling needed for a successful local testing experience.
 * This script is an helper to clean up the environment fully
 * before running the test suite.
 *
 * You should use this when switching between branches.
 *
 * It will:
 *  - clean up node modules
 *  - clean up the build folder (derived data, gradlew cleanAll)
 *  - clean up the pods folder for RNTester (pod install) (and Podfile.lock too)
 *  - kill all packagers
 *  - remove RNTestProject folder
 *
 * other improvements to consider:
 *   - an option to uninstall the apps (RNTester, RNTestProject) from emulators
 */

const {exec, exit} = require('shelljs');

console.info('Starting the clean up process');

// let's check if Metro is already running, if it is let's kill it and start fresh
if (isPackagerRunning() === 'running') {
  exec("lsof -i :8081 | grep LISTEN | /usr/bin/awk '{print $2}' | xargs kill");
  console.info('Killed Metro');
}

// Android
console.info('Cleaning Gradle build artifacts');
exec('./gradlew cleanAll');

// iOS
console.info('Nuking the derived data folder');
exec('rm -rf ~/Library/Developer/Xcode/DerivedData');

// RNTester Pods
console.info('Removing the RNTester Pods');
exec('rm -rf packages/rn-tester/Pods');
exec('rm -rf packages/rn-tester/Podfile.lock');

// RNTestProject
console.info('Removing the RNTestProject folder');
exec('rm -rf /tmp/RNTestProject');

// final leftover cleanups
console.info('Removing leftovers and node_modules');
exec('rm -f ./*.tgz');
exec('rm -rf node_modules');

// this should make the two rm -rf commands above redundant
// but for now I want to keep it as the explicit last step
console.info('Final git level wipe');
exec('git clean -fdx');

console.info(
  'Clean up process completed\nPlease remember to run yarn install if you are planning to test again',
);
exit(0);
