#!/bin/bash

echo "Publish master or stable?"
select branch in "master" "stable"; do
  read -p "You selected $branch. [Enter] to continue"
  git fetch origin
  git checkout $branch
  git pull origin $branch

  read -p "Just pulled $branch. If everything is okay, hit [Enter]"

  echo "What type of publish?"
  select version_type in "patch" "minor" "major"; do
    read -p "Creating commit and tag for a $version_type release. Press [Enter].";

    # Use npm to increment the version and capture it
    version_with_v=`npm version $version_type`

    # Remove the "v" from v8.8.8 to get 8.8.8
    version=`echo $version_with_v | cut -b 2-`

    # Remove npm's v8.8.8 tag and replace it with 8.8.8
    # because that's what we've always done
    git tag -d $version_with_v

    npm run build:package
    read -p "Just built package. If everything is okay, hit [Enter]"

    # Quickly show changes to verify
    git diff
    read -p "Examine and correct CHANGELOG.md. [Enter] to continue"

    git tag $version

    read -p "git tag updated to $version; [Enter] to continue";
    break
  done

  read -p "Ready to publish redux-delta@$version. [Enter] to continue"
  cd dist/package/
  npm publish
  cd ../../

  read -p "Ready to push $branch. [Enter] to continue"
  git push origin $branch
  git push --tags

  break
done
