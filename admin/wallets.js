import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// ---------------- FIREBASE ----------------
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

// ---------------- ADMIN UID ----------------
const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

// ---------------- DOM ----------------
const usersDiv = document.getElementById("users");
const historyDiv = document.getElementById("history");
const selectedUserDiv = document.getElementById("selectedUser");

const typeEl = document.getElementById("type");
const amountEl = document.getElementById("amount");
const methodEl = document.getElementById("method");
const statusEl = document.getElementById("status");
const addBtn = document.getElementById("add");

let selectedUser = null;

// ---------------- ADMIN CHECK ----------------
onAuthStateChanged(auth, async (user) => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access denied");
    window.location.href = "login.html";
    return;
  }

  loadUsers();
});

// ---------------- LOAD USERS ----------------
async function loadUsers() {
  const snap = await getDocs(collection(db, "users"));

  usersDiv.innerHTML = "";

  snap.forEach(docSnap => {
    const data = docSnap.data();

    const div = document.createElement("div");
    div.className = "user";

    div.innerHTML = `
      <b>${data.name || "No Name"}</b><br>
      <small>${docSnap.id}</small>
    `;

    div.onclick = () => {
      selectedUser = docSnap.id;
      selectedUserDiv.innerHTML = `Selected User: <b>${selectedUser}</b>`;
      loadHistory(selectedUser);
    };

    usersDiv.appendChild(div);
  });
}

// ---------------- LOAD HISTORY ----------------
function loadHistory(uid) {
  const q = query(
    collection(db, "users", uid, "transactions"),
    orderBy("timestamp", "desc")
  );

  onSnapshot(q, (snap) => {
    historyDiv.innerHTML = "";

    if (snap.empty) {
      historyDiv.innerHTML = "<p>No history found</p>";
      return;
    }

    snap.forEach(docSnap => {
      const t = docSnap.data();

      const box = document.createElement("div");
      box.className = "historyItem";

      box.innerHTML = `
        <b>${t.type}</b> - ${t.amount}<br>
        ${t.method || "-"} | ${t.status || "-"}
        <div>
          <button onclick="editTxn('${uid}','${docSnap.id}','${t.amount}','${t.status}')">Edit</button>
          <button onclick="deleteTxn('${uid}','${docSnap.id}')">Delete</button>
        </div>
      `;

      historyDiv.appendChild(box);
    });
  });
}

// ---------------- ADD HISTORY (FIXED) ----------------
addBtn.onclick = async () => {
  try {
    if (!selectedUser) {
      alert("Please select a user first");
      return;
    }

    if (!typeEl.value || !amountEl.value) {
      alert("Fill type and amount");
      return;
    }

    await addDoc(collection(db, "users", selectedUser, "transactions"), {
      type: typeEl.value,
      amount: Number(amountEl.value),
      method: methodEl.value || "-",
      status: statusEl.value || "pending",
      userId: selectedUser,
      timestamp: serverTimestamp()
    });

    alert("✅ History Added Successfully");

    amountEl.value = "";
    methodEl.value = "";
    statusEl.value = "";

  } catch (err) {
    console.error("ADD ERROR:", err);
    alert("❌ Failed to add history");
  }
};

// ---------------- EDIT ----------------
window.editTxn = async (uid, id, oldAmount, oldStatus) => {
  const newAmount = prompt("New Amount", oldAmount);
  const newStatus = prompt("New Status", oldStatus);

  await updateDoc(doc(db, "users", uid, "transactions", id), {
    amount: Number(newAmount),
    status: newStatus
  });

  alert("Updated");
};

// ---------------- DELETE ----------------
window.deleteTxn = async (uid, id) => {
  await deleteDoc(doc(db, "users", uid, "transactions", id));
  alert("Deleted");
};