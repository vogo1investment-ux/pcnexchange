import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, query, where, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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

// ====================== AUTH & REALTIME ======================
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location = "index.html";
    return;
  }

  const userId = user.uid;
  const historyRef = collection(db, "users", userId, "transactions");
  const q = query(historyRef, orderBy("timestamp", "desc"));

  // REALTIME LISTENER
  onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderHistory(data);
  });
});

// ====================== TABS ======================
document.querySelectorAll(".history-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".history-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    activeType = tab.dataset.type;
    // re-render filtered
    getCurrentTransactions().then(renderHistory);
  });
});

// Store latest snapshot
let latestTransactions = [];

function getCurrentTransactions() {
  return Promise.resolve(latestTransactions);
}

// ====================== RENDER HISTORY ======================
function renderHistory(transactions) {
  latestTransactions = transactions;

  // FILTER BY TAB
  let filtered = transactions;
  if (activeType !== "all") {
    filtered = transactions.filter(t => t.type.toLowerCase() === activeType);
  }

  // CLEAR LIST
  historyListEl.innerHTML = "";

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
      ${tx.to ? `<span>To: ${tx.to}</span>` : ""}
      ${tx.from ? `<span>From: ${tx.from}</span>` : ""}
    `;

    const amount = document.createElement("div");
    amount.className = "history-amount " + tx.type.toLowerCase();
    amount.textContent = (tx.type.toLowerCase() === "withdraw" ? "-" : "+") + "$" + (tx.amount || 0).toLocaleString();

    card.appendChild(info);
    card.appendChild(amount);

    historyListEl.appendChild(card);
  });
}