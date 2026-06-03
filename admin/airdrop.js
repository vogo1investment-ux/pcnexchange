import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, getDocs, updateDoc, doc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

async function loadAirdrop() {
  const snap = await getDocs(collection(db, "airdrop"));
  let html = "";
  snap.forEach(docSnap => {
    const a = docSnap.data();
    html += `<div class="bg-zinc-800 p-4 rounded-xl mb-2">
      <p><strong>${a.userId}</strong> requested ${a.amount}</p>
      <button onclick="approveAirdrop('${docSnap.id}','Approved')" class="bg-emerald-400 p-1 rounded mr-1">Approve</button>
      <button onclick="approveAirdrop('${docSnap.id}','Rejected')" class="bg-red-500 p-1 rounded">Reject</button>
    </div>`;
  });
  document.getElementById("airdrop-list").innerHTML = html;
}

window.approveAirdrop = async (id, status) => {
  await updateDoc(doc(db, "airdrop", id), { status });
  loadAirdrop();
};

loadAirdrop();