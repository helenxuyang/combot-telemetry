#!/bin/bash

set -e

BUMP_TYPE="$1"

if [[ "$BUMP_TYPE" != "major" && "$BUMP_TYPE" != "minor" && "$BUMP_TYPE" != "patch" ]]; then
    echo "Usage: ./release.sh <major|minor|patch>"
    exit 1
fi

TAURI_CONFIG="../src-tauri/tauri.conf.json"

# ---------------------------------------------------------------------------
# Checks
# ---------------------------------------------------------------------------

if [[ -n "$(git status --porcelain)" ]]; then
    echo "ERROR: Working tree is not clean."
    echo "Commit or stash your changes before releasing."
    exit 1
fi

echo "=== Updating main ==="

git checkout main
git pull --ff-only origin main

echo "=== Updating release ==="

git checkout release
git pull --ff-only origin release

# ---------------------------------------------------------------------------
# Merge main -> release
# ---------------------------------------------------------------------------

echo "=== Merging main into release ==="

if ! git merge --no-ff main -m "Merge main into release"; then
    echo
    echo "ERROR: Merge conflict."
    echo "Resolve the conflict, commit the merge, then run the release manually."
    echo "The release script has stopped."
    exit 1
fi

# ---------------------------------------------------------------------------
# Determine new version
# ---------------------------------------------------------------------------

echo "=== Calculating new version ==="

VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' "$TAURI_CONFIG" \
    | head -1 \
    | sed 's/.*"\([^"]*\)"$/\1/')

if [[ -z "$VERSION" ]]; then
    echo "ERROR: Could not find version in $TAURI_CONFIG"
    exit 1
fi

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "ERROR: Version '$VERSION' is not in MAJOR.MINOR.PATCH format."
    exit 1
fi

IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION"

case "$BUMP_TYPE" in
    major)
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
    minor)
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    patch)
        PATCH=$((PATCH + 1))
        ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"

echo "Version: $VERSION → $NEW_VERSION"

# ---------------------------------------------------------------------------
# Bump version on release
# ---------------------------------------------------------------------------

echo "=== Updating Tauri version ==="

sed -i "0,/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/s//\"version\": \"$NEW_VERSION\"/" "$TAURI_CONFIG"

# ---------------------------------------------------------------------------
# Commit version bump
# ---------------------------------------------------------------------------

echo "=== Committing version bump ==="

git add "$TAURI_CONFIG"
git commit -m "Bump version to $NEW_VERSION"

VERSION_COMMIT=$(git rev-parse HEAD)

# ---------------------------------------------------------------------------
# Push release
# ---------------------------------------------------------------------------

echo "=== Pushing release ==="

git push origin release

echo
echo "Release branch pushed."
echo "GitHub Actions should now be building version $NEW_VERSION."

# ---------------------------------------------------------------------------
# Apply version bump to main
# ---------------------------------------------------------------------------

echo
echo "=== Applying version bump to main ==="

git checkout main
git cherry-pick "$VERSION_COMMIT"

git push origin main

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------

echo
echo "========================================"
echo "Release complete!"
echo "Version: $NEW_VERSION"
echo "========================================"