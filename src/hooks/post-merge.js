import { execSync } from 'child_process';
import { checkForUpdates } from '../updatePackages';

const changedFiles = execSync('git diff --name-only ORIG_HEAD HEAD');
checkForUpdates(changedFiles.toString());
