import fs from 'fs';
import path from 'path';

const rootDir = path.resolve('.');

// 1. Ensure index.html exists in root (lowercase)
const indexPath = path.join(rootDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  const candidates = [
    path.join(rootDir, 'Index.html'),
    path.join(rootDir, 'src', 'index.html'),
    path.join(rootDir, 'src', 'Index.html'),
    path.join(rootDir, 'public', 'index.html'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      fs.copyFileSync(c, indexPath);
      console.log(`[prebuild] Restored index.html from ${c}`);
      break;
    }
  }
}

// 2. Ensure src/main.tsx exists (lowercase)
const srcDir = path.join(rootDir, 'src');
const mainPath = path.join(srcDir, 'main.tsx');
if (!fs.existsSync(mainPath)) {
  const mainCandidates = [
    path.join(srcDir, 'Main.tsx'),
    path.join(rootDir, 'main.tsx'),
    path.join(rootDir, 'Main.tsx'),
  ];
  for (const c of mainCandidates) {
    if (fs.existsSync(c)) {
      if (!fs.existsSync(srcDir)) fs.mkdirSync(srcDir, { recursive: true });
      fs.copyFileSync(c, mainPath);
      console.log(`[prebuild] Restored src/main.tsx from ${c}`);
      break;
    }
  }
}
