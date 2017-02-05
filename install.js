#!/usr/bin/env node
const fs = require('fs');
const execSync = require('child_process').execSync;

// create a new build if the module is checked out from git
try {
  fs.lstatSync('./dist');
} catch (e) {
  execSync('npm run build');
}

require('./dist/hooks/install').installHooks();
