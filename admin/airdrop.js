import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log("🔥 AIRDROP JS LOADED");

let currentUser = null;

// wait until everything is ready
window.addEventListener("DOMContentLoaded", () => {

  console.log("✅ DOM READY");

  const name = document.getElementById("name");
  const desc = document.getElementById("desc");
  const rate = document.getElementById("rate");
  const amount = document.getElementById("amount");
  const start = document.getElementById("start");
  const end = document.getElementById("end");

  const createBtn = document.getElementById("create");
  const loadBtn = document.getElementById("load");
  const list = document.getElementById("list");
  const users = document.getElementById("users");
  const withdrawals = document.getElementById("withdrawals");

  // AUTH
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    console.log("AUTH:", user?.uid);
  });

  // CREATE AIRDROP
  createBtn?.addEventListener("click", async () => {
    try {
      if (!currentUser) return alert("Login required");

      await addDoc(collection(db, "airdropCampaigns"), {
        name: name.value,
        desc: desc.value,
        rate: Number(rate.value),
        amount: Number(amount.value),
        startTime: Date.now(),
        endTime: Date.now() + 1000000,
        status: "active",
        createdAt: Date.now()
      });

      alert("Airdrop Created");
    } catch (e) {
      console.error(e);
      alert("Error creating airdrop");
    }
  });

  // LOAD AIRDROPS
  loadBtn?.addEventListener("click", async () => {
    try {
      list.innerHTML = "Loading...";

      const snap = await getDocs(collection(db, "airdropCampaigns"));

      list.innerHTML = "";

      snap.forEach((d) => {
        const data = d.data();

        const div = document.createElement("div");
        div.className = "card";

        div.innerHTML = `
          <b>${data.name}</b><br>
          Rate: ${data.rate}<br>
          Status: ${data.status || "active"}<br><br>

          <button onclick="stopAirdrop('${d.id}')">STOP</button>
          <button onclick="deleteAirdrop('${d.id}')">DELETE</button>
        `;

        list.appendChild(div);
      });

    } catch (e) {
      console.error(e);
      alert("Failed to load airdrops");
    }
  });

  // USERS LIVE
  onSnapshot(collection(db, "users"), (snap) => {
    users.innerHTML = "";

    snap.forEach((d) => {
      users.innerHTML += `
        <div class="card">
          User: ${d.id}<br>
          Balance: ${d.data().balance || 0}
        </div>
      `;
    });
  });

  // WITHDRAWALS LIVE
  onSnapshot(collection(db, "airdropWithdrawals"), (snap) => {
    withdrawals.innerHTML = "";

    snap.forEach((d) => {
      const data = d.data();

      withdrawals.innerHTML += `
        <div class="card">
          User: ${data.userId || "unknown"}<br>
          Status: ${data.status || "pending"}<br>

          <button onclick="approve('${d.id}')">APPROVE</button>
          <button onclick="reject('${d.id}')">REJECT</button>
        </div>
      `;
    });
  });

});

// GLOBAL FUNCTIONS (VERY IMPORTANT)
window.stopAirdrop = async (id) => {
  const { getFirestore, doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js");
  await updateDoc(doc(db, "airdropCampaigns", id), { status: "stopped" });
};

window.deleteAirdrop = async (id) => {
  const { getFirestore, doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js");
  await deleteDoc(doc(db, "airdropCampaigns", id));
};

window.approve = async (id) => {
  const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js");
  await updateDoc(doc(db, "airdropWithdrawals", id), { status: "approved" });
};

window.reject = async (id) => {
  const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js");
  await updateDoc(doc(db, "airdropWithdrawals", id), { status: "rejected" });
};