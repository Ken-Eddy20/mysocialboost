import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const dbPath = path.join(__dirname, 'database.json');

// Initialize DB if not exists
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [] }, null, 2));
}

function getDB() {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function saveDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

// ----- AUTH ROUTES -----
app.post('/api/signup', (req, res) => {
    const { username, email, password } = req.body;
    let db = getDB();
    if (db.users.find(u => u.email === email || u.username === username)) {
        return res.json({ success: false, message: 'Email or Username already exists' });
    }
    const token = crypto.randomBytes(16).toString('hex');
    const newUser = { id: Date.now().toString(), username, email, password, balance: 0.00, token };
    db.users.push(newUser);
    saveDB(db);
    res.json({ success: true, token, user: { username: newUser.username, email: newUser.email, balance: newUser.balance } });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const db = getDB();
    const user = db.users.find(u => u.email === email && u.password === password);
    if (user) {
        res.json({ success: true, token: user.token, user: { username: user.username, email: user.email, balance: user.balance } });
    } else {
        res.json({ success: false, message: 'Invalid credentials' });
    }
});

app.get('/api/me', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const user = getDB().users.find(u => u.token === token);
    if (user) {
        res.json({ success: true, user: { username: user.username, email: user.email, balance: user.balance } });
    } else {
        res.json({ success: false, message: 'Not authenticated' });
    }
});

// ----- WALLET ROUTE -----
app.post('/api/add-funds', (req, res) => {
    const { token, amountGHS } = req.body; 
    let db = getDB();
    let userIndex = db.users.findIndex(u => u.token === token);
    if (userIndex === -1) return res.json({ success: false, message: 'Unauthorized' });

    // Amount is passed in GHS for simplicity, convert to USD to store balance natively
    // In production, verify transaction reference with Paystack API before crediting!
    const GHS_TO_USD = 0.067;
    const addedUsd = parseFloat((amountGHS * GHS_TO_USD).toFixed(2));
    
    db.users[userIndex].balance += addedUsd;
    saveDB(db);
    
    console.log(`[Backend Secure Logs] Topup successful. Added $${addedUsd} to ${db.users[userIndex].email}`);
    res.json({ success: true, newBalance: db.users[userIndex].balance });
});

// ----- ORDER ROUTE -----
app.post('/api/order', (req, res) => {
    const { token, serviceId, link, quantity, costUsd } = req.body;
    
    let db = getDB();
    let userIndex = db.users.findIndex(u => u.token === token);
    if (userIndex === -1) return res.json({ success: false, message: 'Unauthorized' });
    
    let user = db.users[userIndex];
    if (user.balance < costUsd) {
        return res.json({ success: false, message: 'Insufficient wallet balance. Please add funds.' });
    }

    // Deduct cost from wallet
    user.balance -= costUsd;
    saveDB(db);

    console.log(`[Backend Secure Logs] Wallet order verified for Service ${serviceId}. Deducted $${costUsd} from ${user.email}`);

    // Forward API Call to JAP Reseller Wholesale here...
    
    res.json({ success: true, message: 'Order created successfully.', newBalance: user.balance });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Reseller Panel Server running securely on http://localhost:${PORT}`);
});
