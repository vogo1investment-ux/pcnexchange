import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

const sectionContent = document.getElementById("section-content");
const logoutBtn = document.getElementById("logoutBtn");

// Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "admin-login.html";
});

// Ensure admin is signed in
onAuthStateChanged(auth, async (user) => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied. Admin only.");
    window.location.href = "admin-login.html";
  } else {
    updateSummaryCards();
  }
});

// Dynamic section loader
document.querySelectorAll(".admin-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    const section = btn.dataset.section;
    try {
      const htmlRes = await fetch(`${section}.html`);
      const html = await htmlRes.text();
      sectionContent.innerHTML = html;

      const script = document.createElement("script");
      script.type = "module";
      script.src = `${section}.js`;
      document.body.appendChild(script);

      setTimeout(updateSummaryCards, 500);
    } catch (err) {
      console.error(`Failed to load ${section}`, err);
      sectionContent.innerHTML = `<p class="text-red-500">Failed to load ${section}</p>`;
    }
  });
});

// Summary Cards updater
async function updateSummaryCards() {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const totalUsers = usersSnap.size;

    let totalDeposits = 0, totalWithdrawals = 0;
    for (const docSnap of usersSnap.docs) {
      const u = docSnap.data();
      totalDeposits += u.availableBalance || 0;
      totalWithdrawals += u.withdrawableBalance || 0;
    }

    const pendingTradesSnap = await getDocs(collection(db, "pendingTrades"));
    const pendingTrades = pendingTradesSnap.size;

    const pendingKycSnap = await getDocs(query(collection(db, "kyc"), where("status", "==", "Pending")));
    const pendingKyc = pendingKycSnap.size;

    document.getElementById("totalUsersCard").innerText = `Users: ${totalUsers}`;
    document.getElementById("totalDepositsCard").innerText = `Deposits: $${totalDeposits}`;
    document.getElementById("totalWithdrawalsCard").innerText = `Withdrawals: $${totalWithdrawals}`;
    document.getElementById("pendingTradesCard").innerText = `Pending Trades: ${pendingTrades}`;
    document.getElementById("pendingKycCard").innerText = `KYC Pending: ${pendingKyc}`;
  } catch (err) {
    console.error("Error updating summary cards:", err);
  }
}

// Example helper function for coins section
export async function loadCoins() {
  const coinsSnap = await getDocs(collection(db, "coins"));
  let html = "";
  coinsSnap.forEach(docSnap => {
    const c = docSnap.data();
    html += `<div class="coin-item">
      <input id="name-${docSnap.id}" value="${c.name}">
      <input id="price-${docSnap.id}" value="${c.price}">
      <input id="desc-${docSnap.id}" value="${c.description || ''}">
      <button onclick="updateCoin('${docSnap.id}')">Update</button>
      <button onclick="deleteCoin('${docSnap.id}')">Delete</button>
    </div>`;
  });
  document.getElementById("coins-list").innerHTML = html;
}

export async function updateCoin(id) {
  const name = document.getElementById(`name-${id}`).value.trim();
  const price = document.getElementById(`price-${id}`).value.trim();
  const desc = document.getElementById(`desc-${id}`).value.trim();
  await updateDoc(doc(db, "coins", id), { name, price, description: desc });
  loadCoins();
}

export async function deleteCoin(id) {
  if (confirm("Delete this coin?")) {
    await deleteDoc(doc(db, "coins", id));
    loadCoins();
  }
}