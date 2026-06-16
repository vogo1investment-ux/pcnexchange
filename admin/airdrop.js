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
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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
const auth = getAuth(app);

const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

let isAdmin = false;

// 🔐 LOGIN FIRST
signInAnonymously(auth);

// 🚨 WAIT FOR AUTH BEFORE DOING ANYTHING
onAuthStateChanged(auth, (user) => {

  if (!user) {
    alert("Not logged in");
    return;
  }

  if (user.uid !== ADMIN_UID) {
    alert("❌ You are not admin");
    return;
  }

  isAdmin = true;

  enableAdminPanel();
});

function enableAdminPanel() {

  console.log("Admin verified ✔");

  // ---------------- CREATE AIRDROP ----------------
  document.getElementById("createBtn").addEventListener("click", async () => {

    if (!isAdmin) return alert("Not admin");

    const name = document.getElementById("name").value;
    const desc = document.getElementById("desc").value;
    const rate = document.getElementById("rate").value;
    const amount = document.getElementById("amount").value;
    const start = document.getElementById("start").value;
    const end = document.getElementById("end").value;

    await addDoc(collection(db, "airdropCampaigns"), {
      name, desc, rate, amount, start, end,
      status: "active",
      createdAt: Date.now()
    });

    alert("Airdrop Created ✔");
  });

  // ---------------- LOAD AIRDROPS ----------------
  document.getElementById("loadBtn").addEventListener("click", async () => {

    const box = document.getElementById("airdropList");
    box.innerHTML = "Loading...";

    const snap = await getDocs(collection(db, "airdropCampaigns"));

    box.innerHTML = "";

    snap.forEach(d => {
      const data = d.data();

      box.innerHTML += `
        <div style="background:#111;padding:10px;margin:5px;">
          <b>${data.name}</b><br>
          ${data.desc}<br>
          Rate: ${data.rate}<br>
          Amount: ${data.amount}
        </div>
      `;
    });
  });

  // ---------------- USERS ----------------
  onSnapshot(collection(db, "users"), (snap) => {

    const box = document.getElementById("userList");
    box.innerHTML = "";

    snap.forEach(doc => {
      const d = doc.data();

      box.innerHTML += `
        <div style="padding:10px;border:1px solid #333;margin:5px;">
          👤 ${d.email || "No email"}<br>
          💰 ${d.balance || 0}
        </div>
      `;
    });
  });

  // ---------------- WITHDRAWALS ----------------
  document.getElementById("loadWithdrawBtn").addEventListener("click", async () => {

    const box = document.getElementById("withdrawList");
    box.innerHTML = "Loading...";

    const snap = await getDocs(collection(db, "airdropWithdrawals"));

    box.innerHTML = "";

    snap.forEach(d => {
      const data = d.data();

      box.innerHTML += `
        <div style="border:1px solid red;padding:10px;margin:5px;">
          👤 ${data.userId}<br>
          💸 ${data.amount}<br>
          📌 ${data.status || "pending"}
        </div>
      `;
    });
  });

}