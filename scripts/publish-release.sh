#!/usr/bin/env bash

VERSION=${1}

# Fail on errors
set -e

# Enable verbose debugging.
set -o xtrace

# Save the git commit before anything gets committed.
GIT_COMMIT=$(git rev-list --oneline --max-count=1 HEAD)

# If we're going to be pushing anything, then we might need to set up the git
# environment first.

CICD_SSH_KEY=/cognite-cicd-ssh/cognite-cicd.pem
if [[ -e $CICD_SSH_KEY ]]; then
  mkdir -p /root/.ssh
  cp $CICD_SSH_KEY /root/.ssh/cognite-cicd.pem
  chmod 0400 /root/.ssh/cognite-cicd.pem
  eval $(ssh-agent -s) && ssh-add /root/.ssh/cognite-cicd.pem
  # Add github to the known_hosts file so that our key will work.
  ssh-keyscan -t rsa github.com | tee -a /root/.ssh/known_hosts
  export GIT_SSH_COMMAND="ssh -v -i /root/.ssh/cognite-cicd.pem -F /dev/null"

  git config --global user.email "cicd@cognite.com"
  git config --global user.name "Cognite CICD"
else
  echo "${CICD_SSH_KEY} does not exist; skipping"
fi

# The default fetch URL is https://github.com/cognitedata/repo.git
# We need to use the ssh version, so let's just hack our way in with bash.
# Ew.
if [[ -z $(git remote | grep github) ]]; then
  git remote add github "$(git config --get remote.origin.url | sed 's#https://github.com/#git@github.com:#')"
else
  echo "github remote already exists; skipping"
fi

yarn publish --new-version "$VERSION"

git push github --tags

if [[ ! -z $VERSION ]]; then
  echo "New version published: $VERSION" > publish.msg
  echo "> $GIT_COMMIT" >> publish.msg
  echo "https://www.npmjs.com/package/@cognite/griff-react" >> publish.msg
fi
