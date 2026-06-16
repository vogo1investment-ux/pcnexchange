import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// 🔥 FIREBASE CONFIG
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

const userList = document.getElementById("userList");
const userPanel = document.getElementById("userPanel");

// 🔐 CHECK ADMIN
onAuthStateChanged(auth, (user) => {
  if (!user) {
    userList.innerHTML = "Login required";
    return;
  }

  if (user.uid !== ADMIN_UID) {
    userList.innerHTML = "Access denied";
    return;
  }

  loadUsers();
});

// 👥 LOAD USERS
function loadUsers() {
  const ref = collection(db, "users");

  onSnapshot(ref, (snap) => {
    userList.innerHTML = "";

    snap.forEach((u) => {
      const d = u.data();

      const div = document.createElement("div");
      div.style = `
        padding:10px;
        margin-bottom:8px;
        background:#1f2937;
        border-radius:8px;
        cursor:pointer;
      `;

      div.innerHTML = `
        <b>${d.username || "No Username"}</b><br>
        <small>${d.email || ""}</small>
      `;

      div.onclick = () => openUser(u.id);

      userList.appendChild(div);
    });
  });
}

// 👤 OPEN USER
async function openUser(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    userPanel.innerHTML = "User not found";
    return;
  }

  const d = snap.data();

  userPanel.innerHTML = `
    <h2>👤 ${d.username || "User"}</h2>
    <p><b>UID:</b> ${uid}</p>
    <p><b>Email:</b> ${d.email || ""}</p>

    <hr>

    <label>Available Balance</label>
    <input id="a" value="${d.availableBalance || 0}" style="
      width:100%;
      padding:10px;
      margin-top:6px;
      background:#0f172a;
      color:white;
      border:1px solid #334155;
      border-radius:8px;
      outline:none;
    ">

    <label>Withdrawal Balance</label>
    <input id="w" value="${d.withdrawalBalance || 0}" style="
      width:100%;
      padding:10px;
      margin-top:6px;
      background:#0f172a;
      color:white;
      border:1px solid #334155;
      border-radius:8px;
      outline:none;
    ">

    <label>Referral Commission</label>
    <input id="r" value="${d.referralCommission || 0}" style="
      width:100%;
      padding:10px;
      margin-top:6px;
      background:#0f172a;
      color:white;
      border:1px solid #334155;
      border-radius:8px;
      outline:none;
    ">

    <label>Total Balance</label>
    <input id="b" value="${d.balance || 0}" style="
      width:100%;
      padding:10px;
      margin-top:6px;
      background:#0f172a;
      color:white;
      border:1px solid #334155;
      border-radius:8px;
      outline:none;
    ">

    <label>Referral By</label>
    <input id="ref" value="${d.referralBy || ""}" style="
      width:100%;
      padding:10px;
      margin-top:6px;
      background:#0f172a;
      color:white;
      border:1px solid #334155;
      border-radius:8px;
      outline:none;
    ">

    <button id="save" style="
      width:100%;
      padding:12px;
      margin-top:15px;
      background:#22c55e;
      border:none;
      color:white;
      font-weight:bold;
      border-radius:8px;
      cursor:pointer;
    ">
      SAVE CHANGES
    </button>
  `;

  document.getElementById("save").onclick = async () => {
    await updateDoc(ref, {
      availableBalance: Number(document.getElementById("a").value),
      withdrawalBalance: Number(document.getElementById("w").value),
      referralCommission: Number(document.getElementById("r").value),
      balance: Number(document.getElementById("b").value),
      referralBy: document.getElementById("ref").value
    });

    alert("User updated successfully");
  };
}