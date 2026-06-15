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


// ---------------- FIREBASE ----------------
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


// ---------------- WAIT UNTIL DOM IS READY ----------------
window.addEventListener("DOMContentLoaded", () => {

const name = document.getElementById("name");
const desc = document.getElementById("desc");
const rate = document.getElementById("rate");
const amount = document.getElementById("amount");
const start = document.getElementById("start");
const end = document.getElementById("end");

const createBtn = document.getElementById("createBtn");
const loadBtn = document.getElementById("loadBtn");

const list = document.getElementById("list");
const users = document.getElementById("users");
const withdrawals = document.getElementById("withdrawals");

let user = null;


// ---------------- AUTH ----------------
onAuthStateChanged(auth, (u) => {
  user = u;
});


// ---------------- CREATE AIRDROP ----------------
createBtn.onclick = async () => {
  try {
    if (!user) return alert("Login required");

    await addDoc(collection(db, "airdropCampaigns"), {
      name: name.value,
      desc: desc.value,
      rate: Number(rate.value),
      amount: Number(amount.value),
      startTime: new Date(start.value).getTime(),
      endTime: new Date(end.value).getTime(),
      status: "active",
      createdAt: Date.now()
    });

    alert("✅ Created");
  } catch (e) {
    console.log(e);
    alert("❌ Failed");
  }
};


// ---------------- LOAD AIRDROPS ----------------
loadBtn.onclick = async () => {
  const snap = await getDocs(collection(db, "airdropCampaigns"));

  list.innerHTML = "";

  snap.forEach((d) => {
    const data = d.data();

    const div = document.createElement("div");
    div.className = "box";

    div.innerHTML = `
      <b>${data.name}</b><br>
      Rate: ${data.rate}<br>
      Status: ${data.status}

      <button onclick="stopAir('${d.id}')">STOP</button>
      <button onclick="deleteAir('${d.id}')">DELETE</button>
    `;

    list.appendChild(div);
  });
};


// ---------------- GLOBAL BUTTONS (IMPORTANT FIX) ----------------
window.stopAir = async (id) => {
  await updateDoc(doc(db, "airdropCampaigns", id), {
    status: "stopped"
  });
  alert("Stopped");
};

window.deleteAir = async (id) => {
  await deleteDoc(doc(db, "airdropCampaigns", id));
  alert("Deleted");
};


// ---------------- USERS LIVE ----------------
onSnapshot(collection(db, "users"), (snap) => {
  users.innerHTML = "";

  snap.forEach((d) => {
    const data = d.data();

    users.innerHTML += `
      <div class="box">
        User: ${d.id}<br>
        Balance: ${data.balance || 0}
      </div>
    `;
  });
});


// ---------------- WITHDRAWALS LIVE ----------------
onSnapshot(collection(db, "airdropWithdrawals"), (snap) => {
  withdrawals.innerHTML = "";

  snap.forEach((d) => {
    const data = d.data();

    withdrawals.innerHTML += `
      <div class="box">
        User: ${data.userId}<br>
        Status: ${data.status || "pending"}

        <button onclick="approve('${d.id}')">APPROVE</button>
        <button onclick="reject('${d.id}')">REJECT</button>
      </div>
    `;
  });
});


// ---------------- APPROVE / REJECT ----------------
window.approve = async (id) => {
  await updateDoc(doc(db, "airdropWithdrawals", id), {
    status: "approved"
  });
};

window.reject = async (id) => {
  await updateDoc(doc(db, "airdropWithdrawals", id), {
    status: "rejected"
  });
};

});