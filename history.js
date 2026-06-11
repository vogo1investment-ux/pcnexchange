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
    window.location.href = "login.html";
    return;
  }

  try {
    const txnRef = collection(db, `users/${user.uid}/transactions`);
    const transferRef = collection(db, `users/${user.uid}/transfers`);
    const qTxn = query(txnRef, orderBy("createdAt", "desc"));
    const qTransfer = query(transferRef, orderBy("createdAt", "desc"));

    const [txnSnap, transferSnap] = await Promise.all([getDocs(qTxn), getDocs(qTransfer)]);

    const allItems = [];

    txnSnap.forEach(doc => {
      const d = doc.data();
      allItems.push({
        type: d.type,
        amount: d.amount,
        coin: d.coin || "-",
        date: d.createdAt ? d.createdAt.toDate().toLocaleString() : "-",
        detail: d.detail || "-"
      });
    });

    transferSnap.forEach(doc => {
      const d = doc.data();
      allItems.push({
        type: d.type,
        amount: d.amount,
        coin: d.coin || "-",
        date: d.createdAt ? d.createdAt.toDate().toLocaleString() : "-",
        detail: `From: ${d.from || "-"} / To: ${d.to || "-"}`
      });
    });

    // Sort by date descending
    allItems.sort((a,b) => new Date(b.date) - new Date(a.date));

    // Render
    if(allItems.length === 0){
      historyContainer.innerHTML = "<p class='text-zinc-400'>No transactions yet</p>";
    } else {
      historyContainer.innerHTML = `<table class="min-w-full text-left">
        <thead>
          <tr>
            <th class="p-2">Type</th>
            <th class="p-2">Coin</th>
            <th class="p-2">Amount</th>
            <th class="p-2">Details</th>
            <th class="p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          ${allItems.map(i => `<tr>
            <td class="p-2">${i.type}</td>
            <td class="p-2">${i.coin}</td>
            <td class="p-2">${i.amount}</td>
            <td class="p-2">${i.detail}</td>
            <td class="p-2">${i.date}</td>
          </tr>`).join("")}
        </tbody>
      </table>`;
    }

  } catch (err) {
    console.error(err);
    historyContainer.innerHTML = "<p class='text-red-500'>Failed to load history</p>";
  }
});