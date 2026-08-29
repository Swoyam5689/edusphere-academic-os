import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const outZipPath = path.resolve(rootDir, 'edusphere-academic-os.zip');
const scratchZipPath = path.resolve(rootDir, '../edusphere-academic-os.zip');
const artifactZipPath = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\445ae188-8915-48d7-9066-2994527d7e9e\\edusphere-academic-os.zip';

console.log('📦 Creating EduSphere Academic OS ZIP archive...');

const output = fs.createWriteStream(outZipPath);
const archive = archiver('zip', {
  zlib: { level: 9 }, // Best compression
});

output.on('close', () => {
  console.log(`✅ Project successfully packaged!`);
  console.log(`   File size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Location: ${outZipPath}`);

  // Also copy to parent scratch directory & artifact directory for convenience
  try {
    fs.copyFileSync(outZipPath, scratchZipPath);
    console.log(`   Mirrored to: ${scratchZipPath}`);
  } catch (e) {
    // Ignore
  }

  try {
    fs.copyFileSync(outZipPath, artifactZipPath);
    console.log(`   Mirrored to: ${artifactZipPath}`);
  } catch (e) {
    // Ignore
  }
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Append files and folders ignoring node_modules, dist, and zip files
archive.glob('**/*', {
  cwd: rootDir,
  ignore: [
    'node_modules/**',
    'dist/**',
    '*.zip',
    '.git/**',
    'dev.db-journal',
  ],
});

archive.finalize();
