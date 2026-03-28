import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

function copyIfExists(name) {
    const src = path.join(root, name);
    if (fs.existsSync(src)) {
        const dest = path.join(dist, name);
        const stat = fs.statSync(src);
        if (stat.isDirectory()) {
            fs.cpSync(src, dest, { recursive: true });
        } else {
            fs.copyFileSync(src, dest);
        }
    }
}

for (const f of ['server.js', 'index.html', 'package.json', 'package-lock.json', 'paystack-callback.html']) {
    copyIfExists(f);
}
for (const d of ['js', 'css', 'lib']) {
    copyIfExists(d);
}

console.log('Build complete: dist/');
