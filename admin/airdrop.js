import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";


// ---------------- CONFIG ----------------
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


// ---------------- DOM WAIT FIX ----------------
window.addEventListener("load", () => {

const name = document.getElementById("name");
const desc = document.getElementById("desc");
const rate = document.getElementById("rate");
const amount = document.getElementById("amount");
const start = document.getElementById("start");
const end = document.getElementById("end");

const createBtn = document.getElementById("createBtn");
const loadBtn = document.getElementById("loadBtn");

const list = document.getElementById("list");
const usersDiv = document.getElementById("users");
const withdrawalsDiv = document.getElementById("withdrawals");

let admin = null;


// ---------------- AUTH ----------------
onAuthStateChanged(auth, (user) => {
  admin = user;
});


// ---------------- CREATE AIRDROP ----------------
createBtn.onclick = async () => {
  try {

    if (!admin) return alert("Login required");

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

    alert("Airdrop created");

  } catch (e) {
    console.log(e);
    alert("Failed to create");
  }
};


// ---------------- LOAD AIRDROPS ----------------
loadBtn.onclick = async () => {

  list.innerHTML = "Loading...";

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
      <button onclick="delAir('${d.id}')">DELETE</button>
    `;

    list.appendChild(div);
  });
};


// ---------------- GLOBAL BUTTON FIX ----------------
window.stopAir = async (id) => {
  await updateDoc(doc(db, "airdropCampaigns", id), {
    status: "stopped"
  });
  alert("Stopped");
};

window.delAir = async (id) => {
  await deleteDoc(doc(db, "airdropCampaigns", id));
  alert("Deleted");
};


// ---------------- USERS LIVE ----------------
onSnapshot(collection(db, "users"), (snap) => {
  usersDiv.innerHTML = "";

  snap.forEach((d) => {
    const data = d.data();

    usersDiv.innerHTML += `
      <div class="box">
        <b>User:</b> ${d.id}<br>
        Balance: ${data.balance || 0}
      </div>
    `;
  });
});


// ---------------- WITHDRAWALS LIVE ----------------
onSnapshot(collection(db, "airdropWithdrawals"), (snap) => {

  withdrawalsDiv.innerHTML = "";

  snap.forEach((d) => {
    const data = d.data();

    withdrawalsDiv.innerHTML += `
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

}); // END LOAD