import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
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

let allTransactions = [];
let activeType = "all";

onAuthStateChanged(auth, async(user) => {

  if (!user) {
    location.href = "login.html";
    return;
  }

  await loadHistory(user.uid);
});

async function loadHistory(uid) {

  allTransactions = [];

  try {

    // ======================
    // DEPOSITS + WITHDRAWALS
    // ======================

    const pendingQuery = query(
      collection(db, "pendingTransactions"),
      where("userId", "==", uid)
    );

    const pendingSnap = await getDocs(pendingQuery);

    pendingSnap.forEach(doc => {
      allTransactions.push({
        id: doc.id,
        source: "pendingTransactions",
        ...doc.data()
      });
    });

    // ======================
    // STAKES
    // ======================

    const stakeQuery = query(
      collection(db, "stakes"),
      where("userId", "==", uid)
    );

    const stakeSnap = await getDocs(stakeQuery);

    stakeSnap.forEach(doc => {

      const data = doc.data();

      allTransactions.push({
        id: doc.id,
        source: "stakes",
        type: "stake",
        amount: data.amount || 0,
        status: data.status || "Pending",
        createdAt: data.createdAt,
        ...data
      });
    });

    // ======================
    // TRANSFERS / RECEIVED
    // ======================

    const txQuery = query(
      collection(db, "transactions"),
      where("userId", "==", uid)
    );

    const txSnap = await getDocs(txQuery);

    txSnap.forEach(doc => {
      allTransactions.push({
        id: doc.id,
        source: "transactions",
        ...doc.data()
      });
    });

    sortHistory();

    renderHistory();

  } catch(err) {
    console.error(err);

    historyList.innerHTML = `
      <div class="history-card">
        Error loading history
      </div>
    `;
  }
}

function sortHistory() {

  allTransactions.sort((a,b) => {

    const aTime =
      a.createdAt?.seconds ||
      a.timestamp?.seconds ||
      0;

    const bTime =
      b.createdAt?.seconds ||
      b.timestamp?.seconds ||
      0;

    return bTime - aTime;
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

  let records = [...allTransactions];

  if(activeType !== "all") {

    records = records.filter(tx => {

      const type = (tx.type || "")
        .toLowerCase()
        .trim();

      switch(activeType) {

        case "deposit":
          return type === "deposit";

        case "withdrawal":
          return type === "withdraw";

        case "stake":
          return type === "stake";

        case "transfer":
          return type === "transfer";

        case "received":
          return type === "receive";

        default:
          return true;
      }
    });
  }

  if(records.length === 0) {

    historyList.innerHTML = `
      <div class="history-card">
        <p>No transactions found</p>
      </div>
    `;

    return;
  }

  records.forEach(tx => {

    let amountColor = "#00ff66";

    if((tx.type || "").toLowerCase() === "withdraw")
      amountColor = "#ff4444";

    if((tx.status || "").toLowerCase() === "pending")
      amountColor = "#ffaa00";

    let dateText = "No Date";

    try {

      if(tx.createdAt?.toDate)
        dateText = tx.createdAt.toDate().toLocaleString();

      else if(tx.timestamp?.toDate)
        dateText = tx.timestamp.toDate().toLocaleString();

    } catch(e){}

    const card = document.createElement("div");

    card.className = "history-card";

    card.innerHTML = `

      <div class="history-info">

        <strong>${(tx.type || "Transaction").toUpperCase()}</strong>

        <small>${dateText}</small>

        ${tx.coin ? `<p>Coin: ${tx.coin}</p>` : ""}
        ${tx.region ? `<p>Region: ${tx.region}</p>` : ""}
        ${tx.method ? `<p>Method: ${tx.method}</p>` : ""}
        ${tx.recipient ? `<p>Recipient: ${tx.recipient}</p>` : ""}
        ${tx.proofName ? `<p>Proof: ${tx.proofName}</p>` : ""}

        <p>Status: ${tx.status || "Pending"}</p>

      </div>

      <div
        class="history-amount"
        style="color:${amountColor}">
        $${Number(tx.amount || 0).toLocaleString()}
      </div>

    `;

    historyList.appendChild(card);
  });
}