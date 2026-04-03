import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    sendEmailVerification
} from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js';

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
const auth = getAuth(app);

window.firebaseApp = app;
window.firebaseAnalytics = analytics;
window.firebaseDb = db;
window.firebaseAuth = auth;

window.fbSignUp = (email, pw) => createUserWithEmailAndPassword(auth, email, pw);
window.fbSignIn = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
window.fbSignOut = () => signOut(auth);
window.fbResetPassword = (email) => sendPasswordResetEmail(auth, email);
window.fbUpdateProfile = (user, data) => updateProfile(user, data);
window.fbGetToken = () => (auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null));
window.fbUser = () => auth.currentUser;

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

window.fbSignInWithGoogle = () => signInWithPopup(auth, googleProvider);
window.fbSignInWithFacebook = () => signInWithPopup(auth, facebookProvider);
window.fbSendEmailVerification = (user) => sendEmailVerification(user);

let _pendingAuthUser = undefined;
let _authReady = false;

onAuthStateChanged(auth, (user) => {
    _pendingAuthUser = user;
    _authReady = true;
    if (typeof window.onFirebaseAuthChanged === 'function') {
        window.onFirebaseAuthChanged(user);
    }
});

window.fbCheckPendingAuth = () => {
    if (_authReady && typeof window.onFirebaseAuthChanged === 'function') {
        window.onFirebaseAuthChanged(_pendingAuthUser);
    }
};
