import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  increment
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

const usersDiv = document.getElementById("users");
const requestsDiv = document.getElementById("requests");

/* ---------------- LOAD EVERYTHING ---------------- */
document.getElementById("fetchBtn").addEventListener("click", async () => {
  loadUsers();
  loadRequests();
});

/* ---------------- USERS (AUTO SHOW ALL COINS) ---------------- */
async function loadUsers() {

  const snap = await getDocs(collection(db, "users"));

  usersDiv.innerHTML = "";

  snap.forEach((u) => {

    const div = document.createElement("div");
    div.className = "bg-zinc-900 p-3 rounded-xl mb-3 border border-zinc-700";

    div.innerHTML = `
      <p class="text-green-400">👤 ${u.id}</p>

      <input id="coin-${u.id}" placeholder="Coin (BTC, ADA)"
        class="w-full p-2 bg-black border mt-2">

      <input id="amt-${u.id}" placeholder="Amount"
        class="w-full p-2 bg-black border mt-2">

      <button class="bg-emerald-500 text-black px-3 py-2 mt-2 rounded"
        onclick="addCoin('${u.id}')">
        ➕ Add / Update Coin
      </button>
    `;

    usersDiv.appendChild(div);
  });
}

/* ---------------- ADD COIN TO USER ---------------- */
window.addCoin = async (userId) => {

  const coin = document.getElementById(`coin-${userId}`).value;
  const amount = Number(document.getElementById(`amt-${userId}`).value);

  if (!coin || !amount) return alert("Fill inputs");

  const ref = doc(db, "users", userId, "coins", coin);

  await setDoc(ref, {
    balance: increment(amount)
  }, { merge: true });

  alert("Coin updated!");
};

/* ---------------- LOAD REQUESTS ---------------- */
async function loadRequests() {

  const snap = await getDocs(collection(db, "pendingTransactions"));

  requestsDiv.innerHTML = "";

  snap.forEach((d) => {

    const data = d.data();

    const div = document.createElement("div");
    div.className = "bg-zinc-900 p-3 rounded-xl mb-3 border border-blue-500";

    div.innerHTML = `
      <p>👤 ${data.userId}</p>
      <p>🪙 ${data.coinId}</p>
      <p>💰 ${data.amount}</p>
      <p>📌 ${data.status}</p>

      <input id="req-${d.id}" placeholder="Assign coin amount"
        class="w-full p-2 bg-black border mt-2">

      <button class="bg-green-500 text-black px-3 py-2 mt-2 rounded"
        onclick="approve('${d.id}','${data.userId}','${data.coinId}')">
        Approve
      </button>

      <button class="bg-red-500 px-3 py-2 mt-2 rounded"
        onclick="reject('${d.id}')">
        Reject
      </button>
    `;

    requestsDiv.appendChild(div);
  });
}

/* ---------------- APPROVE ---------------- */
window.approve = async (id, userId, coinId) => {

  const amount = Number(document.getElementById(`req-${id}`).value);

  if (!amount) return alert("Enter amount");

  const coinRef = doc(db, "users", userId, "coins", coinId);

  await setDoc(coinRef, {
    balance: increment(amount)
  }, { merge: true });

  await updateDoc(doc(db, "pendingTransactions", id), {
    status: "approved"
  });

  alert("Approved!");
};

/* ---------------- REJECT ---------------- */
window.reject = async (id) => {

  await updateDoc(doc(db, "pendingTransactions", id), {
    status: "rejected"
  });

  alert("Rejected!");
};