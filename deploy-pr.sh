#!/bin/sh

set -e

cd "$(dirname "$0")"

yarn global add jq.node

ACCESS_TOKEN=$(curl --request POST \
  --url https://martincognite.eu.auth0.com/oauth/token \
  --header 'content-type: application/json' \
  --data '{"client_id":"'"$PR_CLIENT_ID"'","client_secret":"'"$PR_CLIENT_SECRET"'","audience":"https://pr-server.dev.cognite.ai","grant_type":"client_credentials"}' | jqn 'property("access_token")')


NAME=$CHANGE_ID
REPO=griff-react
FOLDER_NAME=storybook_build
yarn storybook:build
tar -zcvf $FOLDER_NAME.tar.gz $FOLDER_NAME/*

curl https://pr-server.cogniteapp.com/post-pr --header "authorization: bearer $ACCESS_TOKEN" -F "pr=@./$FOLDER_NAME.tar.gz" -F "name=$NAME" -F "repo=$REPO" -F "folderName=$FOLDER_NAME"
