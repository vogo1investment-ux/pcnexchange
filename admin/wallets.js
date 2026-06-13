import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
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

const userList = document.getElementById("userList");
const historyBox = document.getElementById("historyBox");

const uidInput = document.getElementById("uid");
const type = document.getElementById("type");
const amount = document.getElementById("amount");
const method = document.getElementById("method");
const status = document.getElementById("status");

let selectedUser = null;

/* ---------------- ADMIN CHECK ---------------- */
onAuthStateChanged(auth, async user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access denied");
    location.href = "login.html";
    return;
  }

  loadUsers();
});

/* ---------------- LOAD USERS ---------------- */
async function loadUsers() {
  const snap = await getDocs(collection(db, "users"));

  userList.innerHTML = "";

  snap.forEach(doc => {
    const u = doc.id;

    const div = document.createElement("div");
    div.className = "user";
    div.textContent = u;

    div.onclick = () => {
      selectedUser = u;
      uidInput.value = u;
      loadHistory(u);
    };

    userList.appendChild(div);
  });
}

/* ---------------- LOAD HISTORY ---------------- */
function loadHistory(uid) {
  const q = query(
    collection(db, "users", uid, "transactions"),
    orderBy("timestamp", "desc")
  );

  onSnapshot(q, snap => {
    historyBox.innerHTML = "<h3>History</h3>";

    snap.forEach(d => {
      const t = d.data();

      historyBox.innerHTML += `
        <div class="txn">
          <b>${t.type}</b><br>
          Amount: ${t.amount || 0}<br>
          Method: ${t.method || "-"}<br>
          Status: ${t.status || "-"}
        </div>
      `;
    });
  });
}

/* ---------------- ADD HISTORY ---------------- */
document.getElementById("addTxn").onclick = async () => {
  if (!selectedUser) return alert("Select a user first");

  await addDoc(collection(db, "users", selectedUser, "transactions"), {
    type: type.value,
    amount: Number(amount.value),
    method: method.value,
    status: status.value || "pending",
    userId: selectedUser,
    timestamp: serverTimestamp()
  });

  alert("History added!");

  amount.value = "";
  method.value = "";
  status.value = "";
};