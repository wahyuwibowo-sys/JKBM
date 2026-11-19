import fs from 'fs';
import path from 'path';

const distDir = path.resolve('./dist');
const indexPath = path.join(distDir, 'index.html');

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');
  const assetsDir = path.join(distDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    const cssFile = files.find(f => f.endsWith('.css'));
    const jsFile = files.find(f => f.endsWith('.js'));

    if (cssFile && jsFile) {
      const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');
      let jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');

      // Inline image assets as Base64 so they render even inside Google Apps Script iframe
      const imgFiles = files.filter(f => f.endsWith('.png') || f.endsWith('.webp') || f.endsWith('.svg') || f.endsWith('.jpg'));
      for (const img of imgFiles) {
        const ext = path.extname(img).slice(1);
        const mime = ext === 'svg' ? 'image/svg+xml' : ext === 'webp' ? 'image/webp' : 'image/png';
        const b64 = fs.readFileSync(path.join(assetsDir, img)).toString('base64');
        const dataUrl = `data:${mime};base64,${b64}`;
        jsContent = jsContent.replaceAll(`./assets/${img}`, dataUrl);
        jsContent = jsContent.replaceAll(`assets/${img}`, dataUrl);
      }

      html = html.replace(/<link rel="stylesheet"[^>]*>/, `<style>${cssContent}</style>`);
      html = html.replace(/<script type="module"[^>]*><\/script>/, `<script>${jsContent.replace(/<\/script>/g, '<\\/script>')}</script>`);

      fs.writeFileSync(path.join(distDir, 'Index.html'), html, 'utf8');
      
      // Also ensure public directory has it if needed
      const publicDir = path.resolve('./public');
      fs.writeFileSync(path.join(publicDir, 'Index.html'), html, 'utf8');
      console.log('SUCCESS: Apps Script Index.html bundled successfully with inlined images, size: ' + (html.length / 1024).toFixed(2) + ' KB');
    }
  }
}
