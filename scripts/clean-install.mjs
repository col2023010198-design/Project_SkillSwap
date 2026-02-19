import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const nodeModulesPath = path.join(process.cwd(), 'node_modules');
const packageLockPath = path.join(process.cwd(), 'package-lock.json');

console.log('Removing corrupted node_modules...');
if (fs.existsSync(nodeModulesPath)) {
  fs.rmSync(nodeModulesPath, { recursive: true, force: true });
  console.log('✓ Removed node_modules');
}

console.log('Removing package-lock.json...');
if (fs.existsSync(packageLockPath)) {
  fs.unlinkSync(packageLockPath);
  console.log('✓ Removed package-lock.json');
}

console.log('Reinstalling dependencies with pnpm...');
try {
  execSync('pnpm install', { stdio: 'inherit' });
  console.log('✓ Dependencies reinstalled successfully');
} catch (error) {
  console.error('✗ Failed to reinstall dependencies');
  process.exit(1);
}

console.log('\n✓ Clean install complete!');