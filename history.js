import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, query, where, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

const historyBody = document.getElementById("historyTableBody");

// Listen for user login
onAuthStateChanged(auth, async user => {
  if (!user) {
    alert("Please log in to view your history");
    window.location.href = "login.html";
    return;
  }

  const userId = user.uid;
  loadUserHistory(userId);
});

async function loadUserHistory(userId) {
  historyBody.innerHTML = "<tr><td colspan='5' class='text-center'>Loading...</td></tr>";

  try {
    // Query the user's transactions from the main collection (pendingTransactions)
    const txnQuery = query(
      collection(db, "pendingTransactions"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const txnSnap = await getDocs(txnQuery);

    if (txnSnap.empty) {
      historyBody.innerHTML = "<tr><td colspan='5' class='text-center'>No history found</td></tr>";
      return;
    }

    historyBody.innerHTML = "";
    txnSnap.forEach(docSnap => {
      const data = docSnap.data();
      const date = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : "";
      const type = data.type || "";
      const coin = data.coin || "-";
      const amount = data.amount || "-";
      const status = data.status || "-";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="px-2 py-1">${date}</td>
        <td class="px-2 py-1">${type}</td>
        <td class="px-2 py-1">${coin}</td>
        <td class="px-2 py-1">${amount}</td>
        <td class="px-2 py-1">${status}</td>
      `;
      historyBody.appendChild(row);
    });

  } catch (err) {
    console.error(err);
    historyBody.innerHTML = "<tr><td colspan='5' class='text-center text-red-500'>Failed to load history</td></tr>";
  }
}