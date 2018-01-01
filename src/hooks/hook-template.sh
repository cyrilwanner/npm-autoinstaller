#!/bin/bash
# ------------------------------------------------------------------------------
# npm-autoinstaller
# {INFO}
# ------------------------------------------------------------------------------
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_EXEC="node"
SYSTEM="$(uname)"

function isNodeExecAvailable {
  if ! type "$NODE_EXEC" > /dev/null 2>&1; then
    return 1;
  fi
  return 0;
}

function fail {
  echo "npm-autoinstaller: unable to find node!"
  echo "node is not in the \$PATH variable and not installed in the default location"
  exit 0
}

# try to load node from $PATH
if ! isNodeExecAvailable; then
  # paths for windows
  if [[ $SYSTEM == *"CYGWIN"* ]] || [[ $SYSTEM == *"MINGW32"* ]] || [[ $SYSTEM == *"MSYS"* ]]; then
    NODE_EXEC="/c/Program\ Files/nodejs/node.exe"
    if ! isNodeExecAvailable; then
      NODE_EXEC="/c/Program\ Files\ \(x86\)/nodejs/node.exe"
      if ! isNodeExecAvailable; then
        NODE_EXEC="/a/nodejs/node.exe"
        if ! isNodeExecAvailable; then
          NODE_EXEC="/d/nodejs/node.exe"
          if ! isNodeExecAvailable; then
            NODE_EXEC="/e/nodejs/node.exe"
            if ! isNodeExecAvailable; then
              fail
            fi
          fi
        fi
      fi
    fi

  # paths for unix systems
  else
    # try to load node from absolute path
    NODE_EXEC="/usr/local/bin/node"
    if ! isNodeExecAvailable; then
      NODE_EXEC="/usr/bin/node"
      if ! isNodeExecAvailable; then

        # todo: use NVM_DIR env var
        NVM_DIR="$NVM_DIR"
        if [[ -z $NVM_DIR ]]
        then
          NVM_DIR="$(dirname ~)/$(whoami)/.nvm"
        fi

        # try to load node from nvm
        if [ -d "$NVM_DIR/versions/node" ]; then
          NODE_EXEC="$NVM_DIR/versions/node/$(ls $NVM_DIR/versions/node | tail -1)/bin/node"
          if ! isNodeExecAvailable; then
            fail
          fi
        else
          fail
        fi
      fi
    fi
  fi
fi

$NODE_EXEC "$DIR/{PATH}/{HOOK}" "$@"
