import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA6necgxQuPundkmsJLIPrepENhL8QqLSM",
  authDomain: "gpl4-1.firebaseapp.com",
  projectId: "gpl4-1",
  storageBucket: "gpl4-1.firebasestorage.app",
  messagingSenderId: "909594371645",
  appId: "1:909594371645:web:5075471e75edc72e56ac54"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
