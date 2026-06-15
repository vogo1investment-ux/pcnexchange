import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Auto login (important for rules)
signInAnonymously(auth).catch(console.error);

/* ---------------- CREATE AIRDROP ---------------- */

document.getElementById("createBtn").onclick = async () => {
  try {
    await addDoc(collection(db, "airdropCampaigns"), {
      name: name.value,
      desc: desc.value,
      rate: rate.value,
      amount: amount.value,
      start: start.value,
      end: end.value,
      active: true,
      createdAt: Date.now()
    });

    alert("Airdrop Created");
  } catch (e) {
    console.error(e);
    alert("Error creating airdrop");
  }
};

/* ---------------- LOAD AIRDROPS ---------------- */

document.getElementById("loadBtn").onclick = async () => {
  const list = document.getElementById("list");
  list.innerHTML = "Loading...";

  try {
    const snap = await getDocs(collection(db, "airdropCampaigns"));

    list.innerHTML = "";

    snap.forEach(doc => {
      const d = doc.data();

      list.innerHTML += `
        <div style="padding:10px;border:1px solid #ccc;margin:5px;">
          <b>${d.name}</b><br>
          ${d.desc}<br>
          Rate: ${d.rate}<br>
          Amount: ${d.amount}
        </div>
      `;
    });

  } catch (e) {
    console.error(e);
    list.innerHTML = "Error loading airdrops";
  }
};

/* ---------------- LOAD WITHDRAWALS ---------------- */

document.getElementById("loadWithdrawBtn").onclick = async () => {
  const box = document.getElementById("withdrawals");
  box.innerHTML = "Loading...";

  try {
    const snap = await getDocs(collection(db, "airdropWithdrawals"));

    box.innerHTML = "";

    snap.forEach(doc => {
      const d = doc.data();

      box.innerHTML += `
        <div style="border:1px solid red;margin:5px;padding:10px;">
          User: ${d.userId || "unknown"}<br>
          Amount: ${d.amount}<br>
          Status: ${d.status || "pending"}
        </div>
      `;
    });

  } catch (e) {
    console.error(e);
    box.innerHTML = "Error loading withdrawals";
  }
};