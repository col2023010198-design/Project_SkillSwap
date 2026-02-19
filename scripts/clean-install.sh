#!/bin/bash
set -e

echo "Removing corrupted node_modules and lock files..."
rm -rf node_modules package-lock.json

echo "Reinstalling dependencies with pnpm..."
pnpm install

echo "Clean install complete!"
