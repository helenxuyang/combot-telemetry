#!/usr/bin/env bash

set -e

echo "Building Tauri app..."
pnpm tauri build

echo "Preparing build directory..."
rm -rf ../build
mkdir -p ../build

echo "Copying executable..."
cp ../src-tauri/target/release/*.exe ../build/

echo "Build complete!"
ls -lh ../build/*.exe