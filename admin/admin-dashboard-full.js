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

// Admin auth
onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied. Admin only");
    window.location.href = "admin-login.html";
    return;
  }
  attachButtonEvents();
  updateSummaryCards();
});

// Attach button click events
function attachButtonEvents() {
  document.querySelectorAll(".admin-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const section = btn.dataset.section;
      sectionContent.innerHTML = `<div style="padding:20px;color:#00ff88">Loading...</div>`;

      try {
        let htmlFile = section + ".html";
        let jsFile = section + ".js";

        // Map custom sections
        if (section === "notify-users") {
          htmlFile = "notification.html";
          jsFile = "notification.js";
        } else if (section === "transactions") {
          htmlFile = "admin-transactions.html";
          jsFile = "admin-transactions.js";
        } else if (section === "stake-overview") {
          htmlFile = "stake-overview.html";
          jsFile = "stake-overview.js";
        } else if (section === "coin-import") {
          htmlFile = "coin-import.html";
          jsFile = "coin-import.js";
        } else if (section === "wallet-requests") {
          htmlFile = "wallet-requests.html";
          jsFile = "wallet-requests.js";
        }

        // Load HTML
        const html = await (await fetch(htmlFile)).text();
        sectionContent.innerHTML = html;

        // Remove any previously loaded script with same src
        document.querySelectorAll(`script[src="${jsFile}"]`).forEach(s => s.remove());

        // Load JS
        const script = document.createElement("script");
        script.type = "module";
        script.src = jsFile;
        document.body.appendChild(script);

      } catch (err) {
        console.error(err);
        sectionContent.innerHTML = `<div style="padding:20px;color:red">Failed to load ${section}</div>`;
      }
    });
  });
}

// Update summary cards
async function updateSummaryCards() {
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const totalUsers = usersSnap.size;

    let totalDeposits = 0, totalWithdrawals = 0;
    usersSnap.forEach(docSnap => {
      const u = docSnap.data();
      totalDeposits += u.availableBalance || 0;
      totalWithdrawals += u.withdrawableBalance || 0;
    });

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
