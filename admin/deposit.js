import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-storage.js";

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

// Deposit submission
document.getElementById("submitDeposit").addEventListener("click", async () => {
  const amount = parseFloat(document.getElementById("amount").value);
  const proof = document.getElementById("proof").files[0];

  if (!amount || !proof) return alert("Enter amount and select proof file.");

  try {
    const proofRef = ref(storage, `depositProofs/${Date.now()}_${proof.name}`);
    const snap = await uploadBytes(proofRef, proof);
    const proofUrl = await getDownloadURL(snap.ref);

    const user = auth.currentUser;
    if (!user) return alert("You must be logged in.");

    await addDoc(collection(db, "pendingTransactions"), {
      type: "deposit",
      amount,
      userId: user.uid,
      proofName: proof.name,
      proofUrl,
      status: "Pending",
      createdAt: serverTimestamp()
    });

    alert("Deposit submitted!");
    document.getElementById("amount").value = "";
    document.getElementById("proof").value = "";
    loadWalletHistory();
  } catch (err) {
    console.error(err);
    alert("Failed to submit deposit.");
  }
});

// Wallet request
document.getElementById("requestWalletBtn").addEventListener("click", async () => {
  const coin = document.getElementById("cryptoCoinSelect").value;
  if (!coin) return alert("Select a coin");

  const user = auth.currentUser;
  if (!user) return alert("You must be logged in.");

  try {
    await addDoc(collection(db, "pendingTransactions"), {
      type: "generateWallet",
      coin,
      userId: user.uid,
      status: "Pending",
      createdAt: serverTimestamp()
    });
    alert("Wallet request submitted!");
    document.getElementById("cryptoCoinSelect").value = "";
    loadWalletHistory();
  } catch (err) {
    console.error(err);
    alert("Failed to request wallet.");
  }
});

// Load wallet/deposit history
async function loadWalletHistory() {
  const user = auth.currentUser;
  if (!user) return;

  const walletHistoryDiv = document.getElementById("walletHistory");
  walletHistoryDiv.innerHTML = "<p class='text-zinc-400'>Loading...</p>";

  try {
    const q = query(collection(db, "pendingTransactions"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
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
        <p><strong>Type:</strong> ${d.type}</p>
        ${d.amount ? `<p><strong>Amount:</strong> $${d.amount}</p>` : ""}
        ${d.coin ? `<p><strong>Coin:</strong> ${d.coin}</p>` : ""}
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

onAuthStateChanged(auth, user => {
  if (user) loadWalletHistory();
});