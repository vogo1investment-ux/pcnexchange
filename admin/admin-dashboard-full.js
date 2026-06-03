import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export async function adminLogin(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  if(user.uid !== "XphWRwjVK6NWEtHw9XeoNxXsfT12") {
    throw new Error("Access Denied: Not admin");
  }
  return user;
}

// Ensure admin is signed in before performing any actions
export function onAdminAuth(callback) {
  onAuthStateChanged(auth, user => {
    if(!user || user.uid !== "XphWRwjVK6NWEtHw9XeoNxXsfT12") {
      alert("Access Denied. Please login as admin.");
      window.location.href = "admin-login.html";
    } else {
      callback(user);
    }
  });
}