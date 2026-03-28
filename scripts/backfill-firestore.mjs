/**
 * Sync every user from database.json into Firestore (users + wallets).
 * Run from project root: npm run backfill:firestore
 */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
dotenv.config({ path: path.join(root, '.env') });

const { syncUserToFirestore, initFirestoreAdmin } = await import('../lib/firestore-admin.js');

const dbPath = path.join(root, 'database.json');
if (!fs.existsSync(dbPath)) {
    console.error('No database.json at', dbPath);
    process.exit(1);
}

if (!initFirestoreAdmin()) {
    console.error('Firestore Admin failed to initialize. Check serviceAccountKey.json and .env');
    process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const users = Array.isArray(raw.users) ? raw.users : [];

if (users.length === 0) {
    console.log('No users in database.json');
    process.exit(0);
}

let ok = 0;
let fail = 0;

for (const user of users) {
    const synced = await syncUserToFirestore(user);
    if (synced) {
        ok += 1;
        console.log('Synced:', user.email, '(id:', user.id + ')');
    } else {
        fail += 1;
        console.warn('Failed:', user.email, '(id:', user.id + ')');
    }
}

console.log(`\nDone: ${ok} synced, ${fail} failed, ${users.length} total.`);
