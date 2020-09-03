#!/bin/bash

if [[ $# -ne 3 ]]
then
  printf "\n\nIllegal number of parameters, eg. ./release.sh GITHUB_REPO RELEASE_VERSION GITHUB_API_TOKEN\n"
  exit 2
fi

GITHUB_REPO=$1
RELEASE_VERSION=$2
GITHUB_API_TOKEN=$3

# Change version in package.json
mv package.json package.json.tmp
sed -e "s/\"version\": \".*\"/\"version\": \"$RELEASE_VERSION\"/" package.json.tmp > package.json
rm package.json.tmp

# Generate asset
mkdir -p "$GITHUB_REPO-$RELEASE_VERSION"
cp package.json "$GITHUB_REPO-$RELEASE_VERSION"
cp -R dist "$GITHUB_REPO-$RELEASE_VERSION"
tar -zcvf "$GITHUB_REPO-$RELEASE_VERSION.tgz" "$GITHUB_REPO-$RELEASE_VERSION"
rm -Rf "$GITHUB_REPO-$RELEASE_VERSION"

# Create Github release
UPLOAD_URL=$(curl -s -X POST -H "Accept: application/vnd.github.v3+json" -H "Authorization: token $GITHUB_API_TOKEN" "https://api.github.com/repos/ICIJ/$GITHUB_REPO/releases" -d "{\"tag_name\": \"$RELEASE_VERSION\", \"target_commitish\": \"master\", \"name\": \"$RELEASE_VERSION\", \"body\": \"Create release $RELEASE_VERSION\", \"draft\": false, \"prerelease\": false}"  | jq '.upload_url')

if [ -z "$UPLOAD_URL" ] || [ "$UPLOAD_URL" = 'null' ]
then
  printf "\n\nThe release $RELEASE_VERSION already exists on repo $GITHUB_REPO\n"
  exit 1
fi

# Upload asset to this release
UPLOAD_URL=$(echo "$UPLOAD_URL" | sed -r 's/"//g' | sed -r 's/\{\?name,label\}//g')
curl -m 100 -s -X POST -H "Accept: application/vnd.github.v3+json" -H "Authorization: token $GITHUB_API_TOKEN" -H "Content-Type:application/gzip" --data-binary @"./$GITHUB_REPO-$RELEASE_VERSION.tgz" "$UPLOAD_URL?name=$GITHUB_REPO-$RELEASE_VERSION.tgz&label=$GITHUB_REPO-$RELEASE_VERSION.tgz"

# Delete generated asset
rm -Rf "$GITHUB_REPO-$RELEASE_VERSION.tgz"

# Commit the updated package.json
git add package.json
git commit -m "[release] version $RELEASE_VERSION"
git push origin master

# Publish on npm
npm publish

printf "\n\nDONE"
