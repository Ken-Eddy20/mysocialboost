import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyAjQ2REuJCfGo0-VQ1cO_X7fxrT2-GEWYQ',
  authDomain: 'mysocialboost-a23f2.firebaseapp.com',
  projectId: 'mysocialboost-a23f2',
  storageBucket: 'mysocialboost-a23f2.firebasestorage.app',
  messagingSenderId: '454490141951',
  appId: '1:454490141951:web:776c4d9ccd789bbae248ca',
  measurementId: 'G-TX6RRBPV16',
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

window.firebaseApp = app;
window.firebaseAnalytics = analytics;
window.firebaseDb = db;
