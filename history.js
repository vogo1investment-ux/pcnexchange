import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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
    alert("Please log in to view your history");
    window.location.href = "login.html";
    return;
  }
  await loadUserHistory(user.uid);
});

async function loadUserHistory(userId) {
  historyContainer.innerHTML = "<p class='text-center'>Loading...</p>";

  try {
    const txnQuery = query(
      collection(db, "pendingTransactions"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const txnSnap = await getDocs(txnQuery);

    if (txnSnap.empty) {
      historyContainer.innerHTML = "<p class='text-center text-zinc-400'>No transactions found</p>";
      return;
    }

    // Separate by type
    const deposits = [];
    const withdrawals = [];
    const stakes = [];
    const transfers = [];
    const received = [];

    txnSnap.forEach(doc => {
      const data = doc.data();
      const item = {
        date: data.createdAt?.toDate?.() || new Date(),
        type: data.type || "Unknown",
        coin: data.coin || "-",
        amount: data.amount || 0,
        status: data.status || "-",
        detail: data.detail || "-"
      };

      switch(item.type.toLowerCase()){
        case "deposit": deposits.push(item); break;
        case "withdrawal": withdrawals.push(item); break;
        case "stake": stakes.push(item); break;
        case "transfer": transfers.push(item); break;
        case "received": received.push(item); break;
        default: break;
      }
    });

    function renderSection(title, arr){
      if(arr.length === 0) return "";
      return `<h2 class="text-xl font-bold text-emerald-400 mt-4">${title}</h2>
      <table class="min-w-full text-left border-collapse mb-4">
        <thead>
          <tr>
            <th class="p-2 border-b border-zinc-700">Date</th>
            <th class="p-2 border-b border-zinc-700">Coin</th>
            <th class="p-2 border-b border-zinc-700">Amount</th>
            <th class="p-2 border-b border-zinc-700">Status</th>
            <th class="p-2 border-b border-zinc-700">Detail</th>
          </tr>
        </thead>
        <tbody>
          ${arr.map(i => `
            <tr class="border-b border-zinc-700">
              <td class="p-2">${i.date.toLocaleString()}</td>
              <td class="p-2">${i.coin}</td>
              <td class="p-2">${i.amount}</td>
              <td class="p-2">${i.status}</td>
              <td class="p-2">${i.detail}</td>
            </tr>`).join("")}
        </tbody>
      </table>`;
    }

    historyContainer.innerHTML =
      renderSection("Deposits", deposits) +
      renderSection("Withdrawals", withdrawals) +
      renderSection("Stakes", stakes) +
      renderSection("Transfers", transfers) +
      renderSection("Received", received);

  } catch(err){
    console.error(err);
    historyContainer.innerHTML = "<p class='text-center text-red-500'>Failed to load history</p>";
  }
}