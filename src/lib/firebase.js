import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAqnfzVcoHC8Os4MZCa10n_DpdVg2TBYtI",
  authDomain: "chatapp-10d0a.firebaseapp.com",
  projectId: "chatapp-10d0a",
  storageBucket: "chatapp-10d0a.appspot.com",
  messagingSenderId: "939804178383",
  appId: "1:939804178383:web:9edb52225e8e2b3a2dc4ba"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 
export const storage = getStorage(app);