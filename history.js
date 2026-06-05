import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot
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

const historyList = document.getElementById("historyList");

let activeType = "all";
let allTransactions = [];

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  loadTransactions(user.uid);
});

function loadTransactions(uid) {

  const q = query(
    collection(db, "pendingTransactions"),
    where("userId", "==", uid)
  );

  onSnapshot(q, snapshot => {

    allTransactions = [];

    snapshot.forEach(doc => {
      allTransactions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    allTransactions.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });

    renderHistory();
  });
}

document.querySelectorAll(".history-tab").forEach(tab => {

  tab.addEventListener("click", () => {

    document
      .querySelectorAll(".history-tab")
      .forEach(t => t.classList.remove("active"));

    tab.classList.add("active");

    activeType = tab.dataset.type;

    renderHistory();
  });

});

function renderHistory() {

  historyList.innerHTML = "";

  let transactions = [...allTransactions];

  if (activeType !== "all") {

    transactions = transactions.filter(tx => {

      const type = (tx.type || "").toLowerCase();

      if (activeType === "deposit")
        return type === "deposit";

      if (activeType === "withdrawal")
        return type === "withdraw";

      if (activeType === "stake")
        return type === "stake";

      if (activeType === "transfer")
        return type === "transfer";

      if (activeType === "received")
        return type === "receive";

      return true;
    });
  }

  if (!transactions.length) {

    historyList.innerHTML = `
      <div class="history-card">
        <p>No transactions found</p>
      </div>
    `;

    return;
  }

  transactions.forEach(tx => {

    let amountColor = "#00ff66";

    if ((tx.type || "").toLowerCase() === "withdraw")
      amountColor = "#ff4444";

    if ((tx.status || "").toLowerCase() === "pending")
      amountColor = "#ffaa00";

    let dateText = "No Date";

    try {

      if (tx.createdAt?.toDate) {
        dateText = tx.createdAt.toDate().toLocaleString();
      }

    } catch (e) {}

    const card = document.createElement("div");

    card.className = "history-card";

    card.innerHTML = `
      <div class="history-info">
        <strong>${tx.type || "Transaction"}</strong>
        <small>${dateText}</small>

        ${tx.method ? `<p>Method: ${tx.method}</p>` : ""}
        ${tx.region ? `<p>Region: ${tx.region}</p>` : ""}
        ${tx.recipient ? `<p>Recipient: ${tx.recipient}</p>` : ""}
        ${tx.coin ? `<p>Coin: ${tx.coin}</p>` : ""}

        <p>Status: ${tx.status || "Pending"}</p>
      </div>

      <div class="history-amount"
           style="color:${amountColor}">
        $${Number(tx.amount || 0).toLocaleString()}
      </div>
    `;

    historyList.appendChild(card);
  });
}