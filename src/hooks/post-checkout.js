import { execSync } from 'child_process';
import { checkForUpdates } from '../updatePackages';
import { error } from '../log';

// we get 3 parameters from git: <previous HEAD> <new HEAD> <flag>
if (process.argv.length < 5) {
  error('invalid parameters specified!');
  process.exit(1);
}

// only execute the hook if it's a branch checkout
if (process.argv[4] === '1') {
  const changedFiles = execSync(`git diff --name-only ${process.argv[2]} ${process.argv[3]}`);
  checkForUpdates(changedFiles.toString());
}
