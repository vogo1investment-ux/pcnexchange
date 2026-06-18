import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  increment
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  databaseURL: "https://pcnexchange-default-rtdb.firebaseio.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const requestsDiv = document.getElementById("requests");
const usersDiv = document.getElementById("users");

/* ---------------- FETCH COIN REQUESTS ---------------- */
document.getElementById("fetchBtn").onclick = async () => {

  requestsDiv.innerHTML = "Loading...";

  const snap = await getDocs(collection(db, "pendingTransactions"));

  requestsDiv.innerHTML = "";

  snap.forEach((docSnap) => {
    const d = docSnap.data();

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <p>👤 User: ${d.userId}</p>
      <p>🪙 Coin: ${d.coinId}</p>
      <p>💰 Amount Requested: ${d.amount}</p>
      <p>📌 Status: ${d.status}</p>

      <input id="amt-${docSnap.id}" placeholder="Assign coin (0.00000001)"
        style="width:100%;padding:8px;margin-top:5px;background:black;color:white;border:1px solid #333;border-radius:10px">

      <button onclick="approve('${docSnap.id}','${d.userId}','${d.coinId}')"
        class="btn bg-green-500 text-black mt-2">
        ✅ Approve
      </button>

      <button onclick="reject('${docSnap.id}')"
        class="btn bg-red-500 mt-2">
        ❌ Reject
      </button>
    `;

    requestsDiv.appendChild(div);
  });
};

/* ---------------- APPROVE ---------------- */
window.approve = async (id, userId, coinId) => {

  const input = document.getElementById(`amt-${id}`);
  const amount = Number(input.value);

  if (!amount) return alert("Enter amount");

  const coinRef = doc(db, "users", userId, "coins", coinId);

  await setDoc(coinRef, {
    balance: increment(amount)
  }, { merge: true });

  await updateDoc(doc(db, "pendingTransactions", id), {
    status: "approved"
  });

  alert("Approved & Coin Added!");
};

/* ---------------- REJECT ---------------- */
window.reject = async (id) => {

  await updateDoc(doc(db, "pendingTransactions", id), {
    status: "rejected"
  });

  alert("Rejected!");
};

/* ---------------- LOAD USERS WALLET EDITOR ---------------- */
async function loadUsers() {

  const snap = await getDocs(collection(db, "users"));

  usersDiv.innerHTML = "";

  snap.forEach((u) => {

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <p>👤 ${u.id}</p>

      <input id="coin-${u.id}" placeholder="Coin (BTC, ADA)"
        style="padding:8px;margin:5px;background:black;color:white;border:1px solid #333">

      <input id="amount-${u.id}" placeholder="Amount (0.00000001)"
        style="padding:8px;margin:5px;background:black;color:white;border:1px solid #333">

      <button onclick="addCoin('${u.id}')"
        class="btn bg-emerald-500 text-black">
        ➕ Add / Update Coin
      </button>
    `;

    usersDiv.appendChild(div);
  });
}

window.addCoin = async (userId) => {

  const coin = document.getElementById(`coin-${userId}`).value;
  const amount = Number(document.getElementById(`amount-${userId}`).value);

  if (!coin || !amount) return alert("Fill fields");

  const ref = doc(db, "users", userId, "coins", coin);

  await setDoc(ref, {
    balance: increment(amount)
  }, { merge: true });

  alert("User wallet updated!");
};

loadUsers();