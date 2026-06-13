import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp
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

// CREATE AIRDROP
document.getElementById("create").onclick = async () => {
  await addDoc(collection(db, "airdropCampaigns"), {
    name: document.getElementById("name").value,
    rate: Number(document.getElementById("rate").value),
    price: Number(document.getElementById("price").value),
    startTime: Date.now(),
    endTime: Date.now() + 86400000,
    active: true
  });

  alert("Airdrop created");
};

// LOAD WITHDRAWALS
async function loadWithdrawals() {
  const snap = await getDocs(collection(db, "airdropWithdrawals"));

  const box = document.getElementById("withdrawals");
  box.innerHTML = "";

  snap.forEach(d => {
    const data = d.data();

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <p>User: ${data.uid}</p>
      <p>Amount: ${data.amount}</p>
      <p>Status: ${data.status}</p>
      <button onclick="approve('${d.id}')">Approve</button>
    `;

    box.appendChild(div);
  });
}

window.approve = async (id) => {
  await updateDoc(doc(db, "airdropWithdrawals", id), {
    status: "approved"
  });

  alert("Approved");
  loadWithdrawals();
};

loadWithdrawals();