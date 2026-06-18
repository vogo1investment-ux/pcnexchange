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

const list = document.getElementById("list");
const loadBtn = document.getElementById("loadBtn");

loadBtn.addEventListener("click", async () => {
  list.innerHTML = "Loading...";

  const snap = await getDocs(collection(db, "pendingCoinBuys"));

  list.innerHTML = "";

  snap.forEach((d) => {
    const data = d.data();

    const div = document.createElement("div");
    div.className = "card p-4 rounded-2xl glow";

    div.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-emerald-400 font-bold">🪙 ${data.coin}</h2>
        <span class="text-xs px-2 py-1 rounded bg-yellow-600">
          ${data.status}
        </span>
      </div>

      <p class="text-sm text-gray-300">
        👤 User: <b>${data.username || data.userId}</b>
      </p>

      <p class="text-sm text-gray-300 mb-2">
        💰 Requested: <b>${data.amount}</b>
      </p>

      <input id="amt-${d.id}"
        class="w-full p-2 rounded bg-black border border-gray-700 mb-3 text-white"
        placeholder="Enter approved amount (0.00000001)"
      />

      <div class="flex gap-2">

        <button class="approve btn bg-green-500 px-3 py-2 rounded-xl w-full text-black font-bold"
          data-id="${d.id}"
          data-user="${data.userId}"
          data-coin="${data.coin}">
          ✅ Approve
        </button>

        <button class="reject btn bg-red-500 px-3 py-2 rounded-xl w-full font-bold"
          data-id="${d.id}">
          ❌ Reject
        </button>

      </div>
    `;

    list.appendChild(div);
  });

  attachActions();
});

function attachActions() {

  document.querySelectorAll(".approve").forEach(btn => {
    btn.onclick = async () => {

      const id = btn.dataset.id;
      const userId = btn.dataset.user;
      const coin = btn.dataset.coin;

      const amountInput = document.getElementById(`amt-${id}`);
      const amount = Number(amountInput.value);

      if (!amount || amount <= 0) {
        alert("Enter valid coin amount");
        return;
      }

      const coinRef = doc(db, "users", userId, "coins", coin);

      await setDoc(coinRef, {
        balance: increment(amount)
      }, { merge: true });

      await updateDoc(doc(db, "pendingCoinBuys", id), {
        status: "approved",
        approvedAmount: amount
      });

      alert("✅ Approved successfully!");
    };
  });

  document.querySelectorAll(".reject").forEach(btn => {
    btn.onclick = async () => {

      const id = btn.dataset.id;

      await updateDoc(doc(db, "pendingCoinBuys", id), {
        status: "rejected"
      });

      alert("❌ Rejected!");
    };
  });
}