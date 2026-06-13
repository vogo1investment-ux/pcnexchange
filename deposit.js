import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-storage.js";

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
const storage = getStorage(app);

let currentUser = null;

onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    loadWalletHistory();
  }
});

// --- Deposit Submission ---
document.getElementById("submitDeposit").addEventListener("click", async () => {
  if (!currentUser) return alert("Login first.");

  const amount = parseFloat(document.getElementById("amount").value);
  const proofFile = document.getElementById("proof").files[0];

  if (!amount || !proofFile) return alert("Enter amount and select proof file.");

  try {
    const storageRef = ref(storage, `depositProofs/${Date.now()}_${proofFile.name}`);
    const snap = await uploadBytes(storageRef, proofFile);
    const proofUrl = await getDownloadURL(snap.ref);

    await addDoc(collection(db, "pendingTransactions"), {
      type: "deposit",
      amount,
      userId: currentUser.uid,
      proofName: proofFile.name,
      proofUrl,
      status: "Pending",
      createdAt: serverTimestamp()
    });

    alert("Deposit submitted successfully!");
    document.getElementById("amount").value = "";
    document.getElementById("proof").value = "";

    loadWalletHistory();

  } catch (err) {
    console.error(err);
    alert("Failed to submit deposit.");
  }
});

// --- Wallet/Coin Request ---
document.getElementById("requestWalletBtn").addEventListener("click", async () => {
  if (!currentUser) return alert("Login first.");

  const selected = document.getElementById("cryptoCoinSelect").value;
  if (!selected) return alert("Select a coin or payment method.");

  try {
    await addDoc(collection(db, "pendingTransactions"), {
      type: "walletRequest",
      coinOrPayment: selected,
      userId: currentUser.uid,
      status: "Pending",
      createdAt: serverTimestamp()
    });

    alert(`Request for ${selected} submitted!`);
    document.getElementById("cryptoCoinSelect").value = "";
    loadWalletHistory();

  } catch (err) {
    console.error(err);
    alert("Failed to submit request.");
  }
});

// --- Load combined history ---
async function loadWalletHistory() {
  if (!currentUser) return;

  const walletHistoryDiv = document.getElementById("walletHistory");
  walletHistoryDiv.innerHTML = "<p class='text-zinc-400'>Loading...</p>";

  try {
    const q = query(
      collection(db, "pendingTransactions"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      walletHistoryDiv.innerHTML = "<p class='text-zinc-400'>No history found</p>";
      return;
    }

    walletHistoryDiv.innerHTML = "";
    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      const div = document.createElement("div");
      div.className = "mb-3 p-2 bg-zinc-900 rounded-xl";

      div.innerHTML = `
        <p><strong>Type:</strong> ${d.type === "walletRequest" ? "Wallet/Payment Request" : "Deposit"}</p>
        ${d.amount ? `<p><strong>Amount:</strong> $${d.amount}</p>` : ""}
        ${d.coinOrPayment ? `<p><strong>Coin / Payment:</strong> ${d.coinOrPayment}</p>` : ""}
        ${d.proofUrl ? `<a href="${d.proofUrl}" target="_blank" class="text-emerald-400 underline">View Proof</a>` : ""}
        <p><strong>Status:</strong> ${d.status}</p>
        ${d.adminReply ? `<p><strong>Admin Reply:</strong> ${d.adminReply}</p>` : ""}
      `;

      walletHistoryDiv.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    walletHistoryDiv.innerHTML = "<p class='text-red-500'>Failed to load history.</p>";
  }
}