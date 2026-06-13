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

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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

let selectedUser = null;

const usersDiv = document.getElementById("users");
const historyDiv = document.getElementById("history");
const selectedUserDiv = document.getElementById("selectedUser");

onAuthStateChanged(auth, async user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access denied");
    location.href = "login.html";
    return;
  }

  loadUsers();
});

// LOAD USERS (with UID + name if exists)
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
      selectedUserDiv.innerHTML = "Selected: " + selectedUser;
      loadHistory(selectedUser);
    };

    usersDiv.appendChild(div);
  });
}

// LOAD HISTORY (small cards)
function loadHistory(uid) {
  const q = query(
    collection(db, "users", uid, "transactions"),
    orderBy("timestamp", "desc")
  );

  onSnapshot(q, snap => {
    historyDiv.innerHTML = "";

    snap.forEach(d => {
      const t = d.data();

      const div = document.createElement("div");
      div.className = "historyItem";

      div.innerHTML = `
        <b>${t.type}</b> - ${t.amount}<br>
        ${t.method || "-"} | ${t.status || "-"}
        <div class="row">
          <button class="smallBtn" onclick="editItem('${uid}','${d.id}','${t.type}','${t.amount}','${t.method}','${t.status}')">Edit</button>
          <button class="smallBtn" onclick="deleteItem('${uid}','${d.id}')">Delete</button>
        </div>
      `;

      historyDiv.appendChild(div);
    });
  });
}

// ADD HISTORY
document.getElementById("add").onclick = async () => {
  if (!selectedUser) return alert("Select user first");

  await addDoc(collection(db, "users", selectedUser, "transactions"), {
    type: type.value,
    amount: Number(amount.value),
    method: method.value,
    status: status.value,
    timestamp: serverTimestamp()
  });

  alert("Added");
};

// EDIT
window.editItem = async (uid, id, typeV, amountV, methodV, statusV) => {
  const newAmount = prompt("Amount", amountV);
  const newStatus = prompt("Status", statusV);

  await updateDoc(doc(db, "users", uid, "transactions", id), {
    amount: Number(newAmount),
    status: newStatus
  });

  alert("Updated");
};

// DELETE
window.deleteItem = async (uid, id) => {
  await deleteDoc(doc(db, "users", uid, "transactions", id));
  alert("Deleted");
};