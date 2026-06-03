import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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
const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

const sectionContent = document.getElementById("section-content");
const logoutBtn = document.getElementById("logoutBtn");

// Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "admin-login.html";
});

// Admin auth check
onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied. Only admin allowed.");
    window.location.href = "admin-login.html";
  } else {
    updateSummaryCards();
  }
});

// Sidebar buttons: load corresponding section HTML + JS dynamically
document.querySelectorAll(".admin-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    const section = btn.dataset.section;
    try {
      const htmlResponse = await fetch(`${section}.html`);
      const html = await htmlResponse.text();
      sectionContent.innerHTML = html;

      const script = document.createElement("script");
      script.type = "module";
      script.src = `${section}.js`;
      document.body.appendChild(script);

      // Update summary after any action
      setTimeout(updateSummaryCards, 500);
    } catch (err) {
      console.error(`Failed to load ${section}:`, err);
      sectionContent.innerHTML = `<p class="text-red-500">Failed to load ${section}</p>`;
    }
  });
});

// ---------------- Summary Cards ----------------
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
    console.error("Failed to update summary cards:", err);
  }
}