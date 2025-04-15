import { readdir, rename } from 'fs/promises';
import path from 'path';

const cwd = process.cwd();

// Rename all .js files to .mjs recursively inside a directory
async function renameJsFilesRecursively(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await renameJsFilesRecursively(fullPath); // Recurse into subdirectories
    } else if (entry.isFile() && fullPath.endsWith('.js')) {
      const newPath = fullPath.replace(/\.js$/, '.mjs');
      await rename(fullPath, newPath);
    }
  }
}

// Start from the packages/ folder
const esmPath = path.join(cwd, 'dist', 'esm');

try {
  await renameJsFilesRecursively(esmPath);
  console.log(`✅ Renamed .js files inside: ${esmPath}`);
} catch (err) {
  console.error(`❌ Failed to rename files in ${esmPath}:`, err.message);
}
