import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const historyTableBody = document.getElementById("historyTableBody");
const searchInput = document.getElementById("searchInput");

onAuthStateChanged(auth, async user => {
  if (!user) {
    alert("Please login to view your history.");
    window.location.href = "login.html";
    return;
  }

  const userId = user.uid;
  await loadUserHistory(userId);
});

async function loadUserHistory(userId) {
  historyTableBody.innerHTML = `<tr><td colspan="5" class="p-2 text-center">Loading...</td></tr>`;

  let historyData = [];

  // Fetch user transactions
  const txnSnap = await getDocs(collection(db, `users/${userId}/transactions`));
  txnSnap.forEach(doc => {
    const data = doc.data();
    historyData.push({
      date: data.createdAt?.toDate?.() || new Date(),
      type: data.type || "Transaction",
      coin: data.coin || "-",
      amount: data.amount || 0,
      status: data.status || "-"
    });
  });

  // Fetch user stakes
  const stakeSnap = await getDocs(collection(db, "stakes"));
  stakeSnap.forEach(doc => {
    const data = doc.data();
    if (data.userId === userId) {
      historyData.push({
        date: data.createdAt?.toDate?.() || new Date(),
        type: "Stake",
        coin: data.coin || "-",
        amount: data.amount || 0,
        status: data.status || "-"
      });
    }
  });

  // Fetch pending deposits/withdrawals
  const pendingSnap = await getDocs(collection(db, "pendingTransactions"));
  pendingSnap.forEach(doc => {
    const data = doc.data();
    if (data.userId === userId) {
      historyData.push({
        date: data.createdAt?.toDate?.() || new Date(),
        type: data.type || "Pending",
        coin: data.coin || "-",
        amount: data.amount || 0,
        status: data.status || "Pending"
      });
    }
  });

  // Fetch received (airdrops/referrals)
  const receivedSnap = await getDocs(collection(db, `users/${userId}/received`));
  receivedSnap.forEach(doc => {
    const data = doc.data();
    historyData.push({
      date: data.createdAt?.toDate?.() || new Date(),
      type: "Received",
      coin: data.coin || "-",
      amount: data.amount || 0,
      status: "-"
    });
  });

  // Sort by date descending
  historyData.sort((a, b) => b.date - a.date);

  // Render table
  historyTableBody.innerHTML = "";
  historyData.forEach(entry => {
    const tr = document.createElement("tr");
    tr.className = "border-b border-zinc-700";
    tr.innerHTML = `
      <td class="p-2">${entry.date.toLocaleString()}</td>
      <td class="p-2">${entry.type}</td>
      <td class="p-2">${entry.coin}</td>
      <td class="p-2">${entry.amount}</td>
      <td class="p-2">${entry.status}</td>
    `;
    historyTableBody.appendChild(tr);
  });
}

// Filter functionality
searchInput.addEventListener("input", () => {
  const filter = searchInput.value.toLowerCase();
  document.querySelectorAll("#historyTableBody tr").forEach(row => {
    const type = row.cells[1].innerText.toLowerCase();
    const amount = row.cells[3].innerText.toLowerCase();
    row.style.display = type.includes(filter) || amount.includes(filter) ? "" : "none";
  });
});