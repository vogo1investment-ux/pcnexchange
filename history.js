import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// Firebase config
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

const historyContainer = document.getElementById("historyContainer");

onAuthStateChanged(auth, async user => {
  if (!user) {
    alert("Please log in to view your history.");
    window.location.href = "login.html";
    return;
  }

  const userId = user.uid;
  await loadUserHistory(userId);
});

async function loadUserHistory(userId) {
  historyContainer.innerHTML = "<p class='text-center'>Loading...</p>";

  try {
    let allTransactions = [];

    // 1. Pending Transactions (deposit/withdrawal/wallet requests)
    const pendingSnap = await getDocs(
      query(
        collection(db, "pendingTransactions"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      )
    );
    pendingSnap.forEach(doc => {
      const data = doc.data();
      allTransactions.push({
        date: data.createdAt?.toDate?.() || new Date(),
        type: data.type || "Pending",
        coin: data.coin || "-",
        amount: data.amount || 0,
        status: data.status || "Pending",
        detail: data.detail || "-"
      });
    });

    // 2. Stakes
    const stakesSnap = await getDocs(
      query(
        collection(db, "stakes"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      )
    );
    stakesSnap.forEach(doc => {
      const data = doc.data();
      allTransactions.push({
        date: data.createdAt?.toDate?.() || new Date(),
        type: "Stake",
        coin: data.coin || "-",
        amount: data.amount || 0,
        status: data.status || "-",
        detail: data.detail || "-"
      });
    });

    // 3. Transfers (sent or received)
    const transfersSnap = await getDocs(
      query(
        collection(db, "users", userId, "transfers"),
        orderBy("createdAt", "desc")
      )
    );
    transfersSnap.forEach(doc => {
      const data = doc.data();
      const tType = data.from === userId ? "Transfer Sent" : "Transfer Received";
      allTransactions.push({
        date: data.createdAt?.toDate?.() || new Date(),
        type: tType,
        coin: data.coin || "-",
        amount: data.amount || 0,
        status: data.status || "-",
        detail: `From: ${data.from || "-"} / To: ${data.to || "-"}`
      });
    });

    // 4. Received (airdrops/referrals)
    try {
      const receivedSnap = await getDocs(
        query(collection(db, "users", userId, "received"), orderBy("createdAt", "desc"))
      );
      receivedSnap.forEach(doc => {
        const data = doc.data();
        allTransactions.push({
          date: data.createdAt?.toDate?.() || new Date(),
          type: "Received",
          coin: data.coin || "-",
          amount: data.amount || 0,
          status: "-",
          detail: data.detail || "-"
        });
      });
    } catch(e) {
      console.log("No received collection yet for user.");
    }

    // Sort all transactions by date descending
    allTransactions.sort((a, b) => b.date - a.date);

    // Render
    if (allTransactions.length === 0) {
      historyContainer.innerHTML = "<p class='text-center text-zinc-400'>No transactions yet</p>";
    } else {
      historyContainer.innerHTML = `
        <table class="min-w-full text-left border-collapse">
          <thead>
            <tr>
              <th class="p-2 border-b border-zinc-700">Date</th>
              <th class="p-2 border-b border-zinc-700">Type</th>
              <th class="p-2 border-b border-zinc-700">Coin</th>
              <th class="p-2 border-b border-zinc-700">Amount</th>
              <th class="p-2 border-b border-zinc-700">Status</th>
              <th class="p-2 border-b border-zinc-700">Detail</th>
            </tr>
          </thead>
          <tbody>
            ${allTransactions.map(txn => `
              <tr class="border-b border-zinc-700">
                <td class="p-2">${txn.date.toLocaleString()}</td>
                <td class="p-2">${txn.type}</td>
                <td class="p-2">${txn.coin}</td>
                <td class="p-2">${txn.amount}</td>
                <td class="p-2">${txn.status}</td>
                <td class="p-2">${txn.detail}</td>
              </tr>`).join("")}
          </tbody>
        </table>`;
    }

  } catch(err) {
    console.error("Error loading history:", err);
    historyContainer.innerHTML = "<p class='text-center text-red-500'>Failed to load history</p>";
  }
}