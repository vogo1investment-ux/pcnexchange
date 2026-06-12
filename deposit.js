import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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

// Deposit submission
document.getElementById("submitDeposit").addEventListener("click", async () => {
  const amount = parseFloat(document.getElementById("amount").value);
  const proofFile = document.getElementById("proof").files[0];

  if (!amount || !proofFile) return alert("Enter amount and select proof file.");

  const user = auth.currentUser;
  if (!user) return alert("You must be logged in.");

  try {
    // Upload proof to Firebase Storage
    const storageRef = ref(storage, `depositProofs/${Date.now()}_${proofFile.name}`);
    const snap = await uploadBytes(storageRef, proofFile);
    const proofUrl = await getDownloadURL(snap.ref);

    // Add deposit to pendingTransactions
    await addDoc(collection(db, "pendingTransactions"), {
      type: "deposit",
      amount,
      userId: user.uid,
      proofName: proofFile.name,
      proofUrl,
      status: "Pending",
      createdAt: serverTimestamp()
    });

    alert("Deposit submitted successfully!");
    document.getElementById("amount").value = "";
    document.getElementById("proof").value = "";

    // Reload user's deposit history
    loadWalletHistory();

  } catch (err) {
    console.error(err);
    alert("Failed to submit deposit.");
  }
});

// Load wallet/deposit history
async function loadWalletHistory() {
  const user = auth.currentUser;
  if (!user) return;

  const walletHistoryDiv = document.getElementById("walletHistory");
  walletHistoryDiv.innerHTML = "<p class='text-zinc-400'>Loading...</p>";

  try {
    const q = collection(db, "pendingTransactions");
    const snapshot = await (await getDocs(q)).docs.filter(d => d.data().userId === user.uid);

    if (snapshot.length === 0) {
      walletHistoryDiv.innerHTML = "<p class='text-zinc-400'>No deposit history found</p>";
      return;
    }

    walletHistoryDiv.innerHTML = "";
    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      const div = document.createElement("div");
      div.className = "mb-3 p-2 bg-zinc-900 rounded-xl";
      div.innerHTML = `
        <p><strong>Type:</strong> Deposit</p>
        <p><strong>Amount:</strong> $${d.amount}</p>
        <p><strong>Status:</strong> ${d.status}</p>
        <a href="${d.proofUrl}" target="_blank" class="text-emerald-400 underline">View Proof</a>
      `;
      walletHistoryDiv.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    walletHistoryDiv.innerHTML = "<p class='text-red-500'>Failed to load deposit history.</p>";
  }
}

// Auto-load history when user is logged in
onAuthStateChanged(auth, user => {
  if (user) loadWalletHistory();
});