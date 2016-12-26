npm-autoinstaller - Migrating
=========

Due to the fact that there can only be one git-hook for each action, you may receive this message during installation if you already use another package with git-hooks: `it seems like you already have some git hooks installed.`

There is no universal way to solve this problem, but here is some help:

## You used a package with git-hooks before but you don't need it anymore

If this is the case, simply delete these files (if they exist):
```
.git/hooks/post-checkout
.git/hooks/post-merge
.git/hooks/post-rewrite
```

And execute the following commands:
```bash
cd node_modules/npm-autoinstaller
node install.js
```

The hooks should now be installed like during a normal `npm install`.

## You use a package for managing multiple git-hooks

When using a package for managing multiple git-hooks, for example [git-hooks](https://www.npmjs.com/package/git-hooks), you can manually add the hooks of this package.
The following scripts have to be called:
```bash
node node_modules/npm-autoinstaller/dist/hooks/post-checkout "$@"
node node_modules/npm-autoinstaller/dist/hooks/post-merge "$@"
node node_modules/npm-autoinstaller/dist/hooks/post-rewrite "$@"
```

## You use another package

If you are using another package, you can try to manually add the three commands above to the already existing git-hooks file in `.git/hooks`. But depending on which package you have, they may get overwritten on the next install.
