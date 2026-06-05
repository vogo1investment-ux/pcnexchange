import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

const requestWalletBtn = document.getElementById("requestWalletBtn");
const cryptoCoinSelect = document.getElementById("cryptoCoinSelect");
const walletHistoryDiv = document.getElementById("walletHistory");

// Add new wallet request
requestWalletBtn.addEventListener("click", async () => {
  const coin = cryptoCoinSelect.value;
  const user = auth.currentUser;
  if (!user) return alert("Login required");
  if (!coin) return alert("Select a coin");

  try {
    await addDoc(collection(db, "pendingTransactions"), {
      userId: user.uid,
      type: "generateWallet",
      coin: coin,
      status: "Pending",
      createdAt: Date.now()
    });
    alert("Wallet request submitted!");
    cryptoCoinSelect.value = "";
  } catch (err) {
    console.error(err);
    alert("Failed to submit request: " + err.message);
  }
});

// Real-time wallet history update
onAuthStateChanged(auth, user => {
  if (!user) return walletHistoryDiv.innerHTML = "Login required";

  const q = query(
    collection(db, "pendingTransactions"),
    where("userId", "==", user.uid),
    where("type", "==", "generateWallet"),
    orderBy("createdAt", "desc")
  );

  // Listen in real time
  onSnapshot(q, snapshot => {
    let html = "";
    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      html += `<div class="p-2 border-b border-zinc-700">
        <span>Coin: ${d.coin}</span><br>
        <span>Status: ${d.status || "Pending"}</span><br>
        ${d.adminReply ? `<span class="text-green-400">Wallet: ${d.adminReply}</span>` : ""}
      </div>`;
    });
    walletHistoryDiv.innerHTML = html || "No wallet requests yet";
  });
});