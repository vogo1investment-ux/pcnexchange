import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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
    // All pending transactions where type is "buyCoin"
    const q = query(collection(db, "pendingTransactions"), where("type", "==", "buyCoin"));
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
        <p><strong>Coin:</strong> ${data.coin}</p>
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
  const txnSnap = await getDocs(query(collection(db, "pendingTransactions"), where("__name__", "==", docId)));
  const data = (await txnRef.get()).data?.() || {};

  if (!data) return alert("Transaction not found");

  const userCoinRef = doc(db, `users/${data.userId}/coins/${data.coin}`);
  try {
    // Set the coin if it doesn't exist or increment
    await setDoc(userCoinRef, { amount: Number(data.amount) }, { merge: true });

    // Update pending transaction status
    await updateDoc(txnRef, { status: "Approved" });

    alert(`Approved ${data.coin} for user ${data.userId}`);
    loadWalletRequests(); // reload list

  } catch (err) {
    console.error(err);
    alert("Failed to approve request");
  }
}