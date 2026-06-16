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

signInAnonymously(auth);

// 🔥 WAIT FOR HTML FULLY LOADED (THIS FIXES YOUR ISSUE)
window.addEventListener("DOMContentLoaded", () => {

  // ================= CREATE AIRDROP =================
  document.getElementById("createBtn").addEventListener("click", async () => {

    const name = document.getElementById("name").value;
    const desc = document.getElementById("desc").value;
    const rate = document.getElementById("rate").value;
    const amount = document.getElementById("amount").value;
    const start = document.getElementById("start").value;
    const end = document.getElementById("end").value;

    try {
      await addDoc(collection(db, "airdropCampaigns"), {
        name,
        desc,
        rate,
        amount,
        start,
        end,
        status: "active",
        createdAt: Date.now()
      });

      alert("Airdrop Created ✅");
    } catch (e) {
      console.error(e);
      alert("Error creating airdrop ❌");
    }
  });

  // ================= LOAD AIRDROPS =================
  document.getElementById("loadBtn").addEventListener("click", async () => {

    const box = document.getElementById("airdropList");
    box.innerHTML = "Loading...";

    const snap = await getDocs(collection(db, "airdropCampaigns"));

    box.innerHTML = "";

    snap.forEach(d => {
      const data = d.data();

      box.innerHTML += `
        <div class="item">
          <b>${data.name}</b><br>
          ${data.desc}<br>
          Rate: ${data.rate}<br>
          Amount: ${data.amount}
        </div>
      `;
    });
  });

  // ================= USERS LIVE =================
  onSnapshot(collection(db, "users"), (snap) => {

    const box = document.getElementById("userList");
    box.innerHTML = "";

    snap.forEach(doc => {
      const d = doc.data();

      box.innerHTML += `
        <div class="item">
          👤 ${d.email || "No email"}<br>
          💰 ${d.balance || 0}
        </div>
      `;
    });
  });

  // ================= WITHDRAWALS =================
  document.getElementById("loadWithdrawBtn").addEventListener("click", async () => {

    const box = document.getElementById("withdrawList");
    box.innerHTML = "Loading...";

    const snap = await getDocs(collection(db, "airdropWithdrawals"));

    box.innerHTML = "";

    snap.forEach(d => {
      const data = d.data();

      box.innerHTML += `
        <div class="item">
          👤 ${data.userId}<br>
          💸 ${data.amount}<br>
          📌 ${data.status || "pending"}
        </div>
      `;
    });
  });

});