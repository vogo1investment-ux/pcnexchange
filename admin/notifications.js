import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.getElementById("sendNotifyBtn").addEventListener("click", async () => {
  const uid = document.getElementById("notifyUser").value.trim();
  const msg = document.getElementById("notifyMessage").value.trim();
  if (!msg) return alert("Enter a message");

  if (uid) {
    await addDoc(collection(db, "notifications"), { userId: uid, message: msg, createdAt: Date.now() });
  } else {
    await addDoc(collection(db, "notifications"), { userId: null, message: msg, createdAt: Date.now() });
  }

  alert("Notification sent!");
  document.getElementById("notifyMessage").value = "";
  document.getElementById("notifyUser").value = "";
});