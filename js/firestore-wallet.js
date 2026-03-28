import { doc, getDoc, onSnapshot } from 'https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js';

async function getWallet(userId) {
  const db = window.firebaseDb;
  if (!db) {
    console.warn('getWallet: firebaseDb is not initialized');
    return 0;
  }
  const docRef = doc(db, 'wallets', userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().balance;
  }
  return 0;
}

function listenToWallet(userId, onUpdate) {
  const db = window.firebaseDb;
  if (!db) {
    console.warn('listenToWallet: firebaseDb is not initialized');
    return () => {};
  }
  const docRef = doc(db, 'wallets', userId);

  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      const bal = snapshot.data().balance;
      if (typeof onUpdate === 'function') onUpdate(bal);
      else console.log('Balance:', bal);
    }
  });
}

window.getWallet = getWallet;
window.listenToWallet = listenToWallet;
