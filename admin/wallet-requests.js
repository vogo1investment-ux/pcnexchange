import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, query, getDocs, doc, setDoc, updateDoc, orderBy } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";
const container = document.getElementById("walletRequestsContainer");

onAuthStateChanged(auth, async user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access denied: Admin only");
    window.location.href = "admin-login.html";
    return;
  }
  await loadWalletRequests();
});

async function loadWalletRequests() {
  container.innerHTML = "<p class='text-center'>Loading...</p>";

  try {
    // Get all pending transactions
    const q = query(collection(db, "pendingTransactions"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    if (snap.empty) {
      container.innerHTML = "<p class='text-center text-zinc-400'>No pending wallet requests</p>";
      return;
    }

    container.innerHTML = "";

    snap.forEach(docSnap => {
      const data = docSnap.data();
      const id = docSnap.id;
      const date = data.createdAt?.toDate?.() || new Date();

      const row = document.createElement("div");
      row.className = "p-4 bg-zinc-900 rounded-xl mb-4 border border-zinc-700";

      row.innerHTML = `
        <p><strong>User:</strong> ${data.userId}</p>
        <p><strong>Method/Coin:</strong> ${data.coin || data.method || data.type}</p>
        <p><strong>Requested Amount:</strong> ${data.amount}</p>
        <p><strong>Status:</strong> ${data.status || 'Pending'}</p>
        <p><strong>Date:</strong> ${date.toLocaleString()}</p>
        <button data-id="${id}" class="approveBtn mt-2 bg-emerald-400 text-black p-2 rounded font-bold">Approve</button>
      `;

      container.appendChild(row);
    });

    // Attach approve buttons
    document.querySelectorAll(".approveBtn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const docId = btn.dataset.id;
        await approveWalletRequest(docId);
      });
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p class='text-center text-red-500'>Failed to load wallet requests</p>";
  }
}

async function approveWalletRequest(docId) {
  const txnRef = doc(db, "pendingTransactions", docId);

  try {
    const txnSnap = await getDocs(query(collection(db, "pendingTransactions")));
    const data = (await txnRef.get()).data?.() || {};

    if (!data) return alert("Transaction not found");

    // If the request is a coin, add it to user coins
    if (data.coin) {
      const userCoinRef = doc(db, `users/${data.userId}/coins/${data.coin}`);
      await setDoc(userCoinRef, { amount: Number(data.amount) }, { merge: true });
    }

    // Mark the transaction as approved
    await updateDoc(txnRef, { status: "Approved" });

    alert(`Approved request for user ${data.userId} (${data.coin || data.method || data.type})`);
    loadWalletRequests(); // reload list
  } catch (err) {
    console.error(err);
    alert("Failed to approve request");
  }
}