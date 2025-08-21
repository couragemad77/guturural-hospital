import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDlgnX8ZQZAMpwtVa5_KPSMKRQ168hXsgg",
  authDomain: "guturural-65f52.firebaseapp.com",
  projectId: "guturural-65f52",
  storageBucket: "guturural-65f52.firebasestorage.app",
  messagingSenderId: "604953585481",
  appId: "1:604953585481:web:f2121c05e6fbabb9ad1c98"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;