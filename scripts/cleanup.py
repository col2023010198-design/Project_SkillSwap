import os
import shutil

# Remove corrupted node_modules
node_modules_path = '/vercel/share/v0-project/node_modules'
lock_file = '/vercel/share/v0-project/pnpm-lock.yaml'

try:
    if os.path.exists(node_modules_path):
        print(f"Removing corrupted node_modules...")
        shutil.rmtree(node_modules_path)
        print("✓ Removed node_modules")
    
    if os.path.exists(lock_file):
        print(f"Removing lock file...")
        os.remove(lock_file)
        print("✓ Removed pnpm-lock.yaml")
    
    print("\nCleanup complete! Dependencies will be reinstalled automatically.")
except Exception as e:
    print(f"Error during cleanup: {e}")
