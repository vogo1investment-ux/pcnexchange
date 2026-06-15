import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";


// ---------------- FIREBASE CONFIG ----------------
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


// ---------------- ELEMENTS ----------------
const list = document.getElementById("list");
const usersDiv = document.getElementById("users");
const withdrawalsDiv = document.getElementById("withdrawals");

const name = document.getElementById("name");
const desc = document.getElementById("desc");
const rate = document.getElementById("rate");
const amount = document.getElementById("amount");
const start = document.getElementById("start");
const end = document.getElementById("end");

const createBtn = document.getElementById("create");
const loadBtn = document.getElementById("load");


// ---------------- AUTH CHECK ----------------
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Login required");
  }
});


// ---------------- CREATE AIRDROP ----------------
createBtn.onclick = async () => {
  try {

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

    alert("✅ Airdrop Created");

    name.value = "";
    desc.value = "";
    rate.value = "";
    amount.value = "";
    start.value = "";
    end.value = "";

  } catch (e) {
    console.log(e);
    alert("❌ Error creating airdrop");
  }
};


// ---------------- LOAD AIRDROPS ----------------
loadBtn.onclick = async () => {
  list.innerHTML = "Loading...";

  const snap = await getDocs(collection(db, "airdropCampaigns"));

  if (snap.empty) {
    list.innerHTML = "No airdrops";
    return;
  }

  list.innerHTML = "";

  snap.forEach((d) => {
    const data = d.data();

    const div = document.createElement("div");
    div.innerHTML = `
      <div style="background:#222;padding:10px;margin:10px;border-radius:8px;">
        <b>${data.name}</b><br>
        Rate: ${data.rate}<br>
        Status: ${data.status}

        <br><br>

        <button onclick="stopAirdrop('${d.id}')">Stop</button>
        <button onclick="deleteAirdrop('${d.id}')">Delete</button>
      </div>
    `;

    list.appendChild(div);
  });
};


// ---------------- STOP AIRDROP ----------------
window.stopAirdrop = async (id) => {
  try {
    await updateDoc(doc(db, "airdropCampaigns", id), {
      status: "stopped"
    });
    alert("Stopped");
  } catch (e) {
    console.log(e);
  }
};


// ---------------- DELETE AIRDROP ----------------
window.deleteAirdrop = async (id) => {
  try {
    await deleteDoc(doc(db, "airdropCampaigns", id));
    alert("Deleted");
  } catch (e) {
    console.log(e);
  }
};


// ---------------- LOAD USERS MINING ----------------
function loadUsers() {
  onSnapshot(collection(db, "users"), (snap) => {

    usersDiv.innerHTML = "";

    snap.forEach((d) => {
      const data = d.data();

      const div = document.createElement("div");
      div.style = "background:#111;margin:5px;padding:8px;border-radius:6px";

      div.innerHTML = `
        User: ${d.id}<br>
        Balance: ${data.balance || 0}
      `;

      usersDiv.appendChild(div);
    });

  });
}


// ---------------- LOAD WITHDRAWALS ----------------
function loadWithdrawals() {
  onSnapshot(collection(db, "airdropWithdrawals"), (snap) => {

    withdrawalsDiv.innerHTML = "";

    snap.forEach((d) => {
      const data = d.data();

      const div = document.createElement("div");
      div.style = "background:#111;margin:5px;padding:8px;border-radius:6px";

      div.innerHTML = `
        User: ${data.userId}<br>
        Airdrop: ${data.airdropId}<br>
        Status: ${data.status || "pending"}

        <br>

        <button onclick="approve('${d.id}')">Approve</button>
        <button onclick="reject('${d.id}')">Reject</button>
      `;

      withdrawalsDiv.appendChild(div);
    });

  });
}


// ---------------- APPROVE ----------------
window.approve = async (id) => {
  await updateDoc(doc(db, "airdropWithdrawals", id), {
    status: "approved"
  });
};


// ---------------- REJECT ----------------
window.reject = async (id) => {
  await updateDoc(doc(db, "airdropWithdrawals", id), {
    status: "rejected"
  });
};


// ---------------- AUTO LOAD USERS + WITHDRAWALS ----------------
loadUsers();
loadWithdrawals();