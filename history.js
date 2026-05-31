import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// 🔹 ORIGINAL FIREBASE API
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
const auth = getAuth(app);

let historyListEl = document.getElementById("historyList");
let activeType = "all";
let latestTransactions = [];

// ====================== AUTH & REALTIME ======================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location = "index.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);

  onSnapshot(userRef, (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();

    // Assuming transactions are stored in an array field called "transactions"
    latestTransactions = data.transactions || [];
    renderHistory();
  });
});

// ====================== TABS ======================
document.querySelectorAll(".history-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".history-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    activeType = tab.dataset.type;
    renderHistory();
  });
});

// ====================== RENDER HISTORY ======================
function renderHistory() {
  historyListEl.innerHTML = "";

  let filtered = latestTransactions;
  if (activeType !== "all") {
    filtered = latestTransactions.filter(t => t.type.toLowerCase() === activeType);
  }

  if (filtered.length === 0) {
    historyListEl.innerHTML = `<p style="color:#0f0;">No ${activeType} transactions found.</p>`;
    return;
  }

  filtered.forEach(tx => {
    const card = document.createElement("div");
    card.className = "history-card";

    const info = document.createElement("div");
    info.className = "history-info";
    info.innerHTML = `
      <span class="history-type">${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</span>
      <span class="history-date">${new Date(tx.timestamp?.toMillis ? tx.timestamp.toMillis() : tx.timestamp).toLocaleString()}</span>
      ${tx.from ? `<span>From: ${tx.from}</span>` : ""}
      ${tx.to ? `<span>To: ${tx.to}</span>` : ""}
    `;

    const amount = document.createElement("div");
    amount.className = "history-amount " + tx.type.toLowerCase();
    amount.textContent = (tx.type.toLowerCase() === "withdraw" || tx.type.toLowerCase() === "transfer" ? "-" : "+") + "$" + (tx.amount || 0).toLocaleString();

    card.appendChild(info);
    card.appendChild(amount);
    historyListEl.appendChild(card);
  });
}