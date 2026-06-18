import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import {
  getAuth
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

const list = document.getElementById("list");

document.getElementById("fetchBtn").onclick = async () => {
  list.innerHTML = "Loading...";

  const snap = await getDocs(collection(db, "pendingCoins"));

  list.innerHTML = "";

  snap.forEach((d) => {
    const data = d.data();

    const card = document.createElement("div");
    card.className = "bg-zinc-900 p-4 rounded-xl border border-zinc-700";

    card.innerHTML = `
      <p><b>Coin:</b> ${data.coinId}</p>
      <p><b>Amount:</b> ${data.amount}</p>
      <p><b>User:</b> ${data.userId}</p>

      <button class="approve bg-green-500 px-3 py-1 rounded mt-2 mr-2">
        Approve
      </button>

      <button class="reject bg-red-500 px-3 py-1 rounded mt-2">
        Reject
      </button>
    `;

    // APPROVE
    card.querySelector(".approve").onclick = async () => {

      // 1. add coin to user wallet
      await setDoc(
        doc(db, "users", data.userId, "coins", data.coinId),
        {
          amount: data.amount,
          updatedAt: Date.now()
        },
        { merge: true }
      );

      // 2. update request
      await updateDoc(doc(db, "pendingCoins", d.id), {
        status: "approved"
      });

      alert("Approved!");
    };

    // REJECT
    card.querySelector(".reject").onclick = async () => {
      await updateDoc(doc(db, "pendingCoins", d.id), {
        status: "rejected"
      });

      alert("Rejected!");
    };

    list.appendChild(card);
  });
};