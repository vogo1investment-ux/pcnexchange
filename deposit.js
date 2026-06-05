// deposit.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

const submitDepositBtn = document.getElementById("submitDeposit");
const requestWalletBtn = document.getElementById("requestWalletBtn");
const cryptoCoinSelect = document.getElementById("cryptoCoinSelect");
const walletHistoryDiv = document.getElementById("walletHistory");

// --- Deposit Submission ---
submitDepositBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("You must be logged in to submit deposits.");

  const amount = parseFloat(document.getElementById("amount").value);
  const proof = document.getElementById("proof").files[0];

  if (!amount || !proof) return alert("Enter amount and select proof.");

  try {
    // Optional: you can upload proof to Firebase Storage and save URL
    const depositData = {
      userId: user.uid,
      type: "deposit",
      amount: amount,
      proofName: proof.name,
      status: "Pending",
      createdAt: serverTimestamp()
    };

    await addDoc(collection(db, "pendingTransactions"), depositData);
    alert("Deposit submitted successfully!");
    document.getElementById("amount").value = "";
    document.getElementById("proof").value = "";
  } catch (err) {
    console.error(err);
    alert("Failed to submit deposit: " + err.message);
  }
});

// --- Generate Wallet Request ---
requestWalletBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("You must be logged in to request a wallet.");

  const coin = cryptoCoinSelect.value;
  if (!coin) return alert("Select a coin to request a wallet.");

  try {
    await addDoc(collection(db, "pendingTransactions"), {
      userId: user.uid,
      type: "generateWallet",
      coin: coin,
      status: "Pending",
      adminReply: "",
      createdAt: serverTimestamp()
    });
    alert("Wallet request submitted!");
    cryptoCoinSelect.value = "";
  } catch (err) {
    console.error(err);
    alert("Failed to request wallet: " + err.message);
  }
});

// --- Real-time Wallet / Deposit History ---
onAuthStateChanged(auth, user => {
  if (!user) return walletHistoryDiv.innerHTML = "Login required";

  const q = query(
    collection(db, "pendingTransactions"),
    where("userId", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, snapshot => {
    let html = "";
    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      let display = "";
      if (d.type === "deposit") {
        display = `<span class="font-bold">Deposit:</span> $${d.amount} - Status: ${d.status}`;
      } else if (d.type === "generateWallet") {
        display = `<span class="font-bold">Wallet Request:</span> ${d.coin} - Status: ${d.status}` +
                  (d.adminReply ? `<br><span class="text-green-400">Wallet Address: ${d.adminReply}</span>` : "");
      }
      html += `<div class="p-2 border-b border-zinc-700">${display}</div>`;
    });
    walletHistoryDiv.innerHTML = html || "No transactions or wallet requests yet";
  });
});