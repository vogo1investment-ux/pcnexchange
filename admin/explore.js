import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

async function loadExplore() {
  const snap = await getDocs(collection(db, "users"));
  let html = "<ul>";
  snap.forEach(docSnap => {
    const u = docSnap.data();
    html += `<li><strong>${u.username}</strong> - Balance: $${u.availableBalance || 0}</li>`;
  });
  html += "</ul>";
  document.getElementById("explore-list").innerHTML = html;
}

loadExplore();