#!/bin/bash

set -e

echo "Updating main..."
git checkout main
git pull origin main

echo "Updating release..."
git checkout release
git pull origin release

echo "Merging main into release..."
git merge main

echo "Pushing release..."
git push origin release

echo "Release build triggered!"

echo "Returning to main..."
git checkout main