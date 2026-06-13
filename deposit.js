import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    loadWalletHistory();
  }
});


// =========================
// DEPOSIT (FIXED - NO IMAGE)
// =========================
document.getElementById("submitDeposit").addEventListener("click", async () => {
  try {
    if (!currentUser) return alert("Login first");

    const amount = document.getElementById("amount").value;

    if (!amount || amount <= 0) {
      return alert("Enter valid amount");
    }

    await addDoc(collection(db, "pendingTransactions"), {
      type: "deposit",
      amount: Number(amount),
      userId: currentUser.uid,
      status: "Pending",
      createdAt: serverTimestamp()
    });

    alert("Deposit submitted successfully!");

    document.getElementById("amount").value = "";

    loadWalletHistory();

  } catch (err) {
    console.error("DEPOSIT ERROR:", err);
    alert("Deposit failed");
  }
});


// =========================
// WALLET REQUEST (UNCHANGED)
// =========================
document.getElementById("requestWalletBtn").addEventListener("click", async () => {
  try {
    if (!currentUser) return alert("Login first");

    const selected = document.getElementById("cryptoCoinSelect").value;
    if (!selected) return alert("Select option");

    await addDoc(collection(db, "pendingTransactions"), {
      type: "walletRequest",
      coinOrPayment: selected,
      userId: currentUser.uid,
      status: "Pending",
      createdAt: serverTimestamp()
    });

    alert("Request sent!");
    loadWalletHistory();

  } catch (err) {
    console.error(err);
    alert("Wallet request failed");
  }
});


// =========================
// HISTORY
// =========================
async function loadWalletHistory() {
  if (!currentUser) return;

  const box = document.getElementById("walletHistory");
  box.innerHTML = "Loading...";

  try {
    const q = query(
      collection(db, "pendingTransactions"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      box.innerHTML = "No history";
      return;
    }

    box.innerHTML = "";

    snap.forEach(doc => {
      const d = doc.data();

      const div = document.createElement("div");
      div.className = "p-2 mb-2 bg-zinc-900 rounded";

      div.innerHTML = `
        <p><b>Type:</b> ${d.type}</p>
        <p><b>Amount:</b> ${d.amount}</p>
        <p><b>Status:</b> ${d.status}</p>
      `;

      box.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    box.innerHTML = "Failed to load history";
  }
}