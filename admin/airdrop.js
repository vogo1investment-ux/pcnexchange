import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";


// ✅ YOUR FIREBASE CONFIG (YOU PROVIDED THIS)
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  databaseURL: "https://pcnexchange-default-rtdb.firebaseio.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// IMPORTANT: allow Firestore access for rules
signInAnonymously(auth).catch(console.error);


// ======================= CREATE AIRDROP =======================
document.getElementById("createBtn").addEventListener("click", async () => {
  try {

    const name = document.getElementById("name").value;
    const desc = document.getElementById("desc").value;
    const rate = document.getElementById("rate").value;
    const amount = document.getElementById("amount").value;
    const start = document.getElementById("start").value;
    const end = document.getElementById("end").value;

    if (!name || !rate || !amount) {
      alert("Fill required fields");
      return;
    }

    await addDoc(collection(db, "airdropCampaigns"), {
      name,
      desc,
      rate: Number(rate),
      amount: Number(amount),
      start,
      end,
      status: "active",
      createdAt: Date.now()
    });

    alert("Airdrop Created ✅");

  } catch (err) {
    console.error(err);
    alert("Error creating airdrop ❌");
  }
});


// ======================= LOAD AIRDROPS =======================
document.getElementById("loadBtn").addEventListener("click", async () => {

  const list = document.getElementById("airdropList");
  list.innerHTML = "Loading...";

  try {

    const snap = await getDocs(collection(db, "airdropCampaigns"));

    list.innerHTML = "";

    snap.forEach(doc => {
      const d = doc.data();

      list.innerHTML += `
        <div style="background:#111;padding:10px;margin:8px;border-radius:8px;">
          <b>${d.name}</b><br>
          ${d.desc || ""}<br>
          💰 Rate: ${d.rate}<br>
          📦 Amount: ${d.amount}<br>
          📌 Status: ${d.status}
        </div>
      `;
    });

  } catch (err) {
    console.error(err);
    list.innerHTML = "Error loading airdrops ❌";
  }
});


// ======================= LIVE USERS =======================
const userBox = document.getElementById("userList");

onSnapshot(collection(db, "users"), (snap) => {

  userBox.innerHTML = "";

  snap.forEach(doc => {
    const d = doc.data();

    userBox.innerHTML += `
      <div style="border:1px solid #333;padding:8px;margin:5px;">
        👤 ${d.email || "No Email"}<br>
        💰 Balance: ${d.balance || 0}
      </div>
    `;
  });

});


// ======================= WITHDRAWALS =======================
document.getElementById("loadWithdrawBtn").addEventListener("click", async () => {

  const box = document.getElementById("withdrawList");
  box.innerHTML = "Loading...";

  try {

    const snap = await getDocs(collection(db, "airdropWithdrawals"));

    box.innerHTML = "";

    snap.forEach(doc => {
      const d = doc.data();

      box.innerHTML += `
        <div style="border:1px solid red;padding:10px;margin:6px;">
          👤 User: ${d.userId || "unknown"}<br>
          💸 Amount: ${d.amount || 0}<br>
          📌 Status: ${d.status || "pending"}
        </div>
      `;
    });

  } catch (err) {
    console.error(err);
    box.innerHTML = "Error loading withdrawals ❌";
  }
});