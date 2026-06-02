import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  databaseURL: "https://pcnexchange-default-rtdb.firebaseio.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Auth state
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "admin.html";
  }
});

// Logout
document.getElementById("logoutBtn").onclick = async () => {
  await signOut(auth);
  window.location.href = "admin.html";
};

// Load dashboard stats
async function loadDashboard() {
  const usersSnap = await getDocs(collection(db, "users"));
  const transactionsSnap = await getDocs(collection(db, "pendingTransactions"));

  document.getElementById("totalUsers").innerText = usersSnap.size;

  let totalDeposits = 0;
  let totalWithdrawals = 0;
  transactionsSnap.forEach(doc => {
    const data = doc.data();
    if(data.type === "deposit") totalDeposits += Number(data.amount || 0);
    if(data.type === "withdrawal") totalWithdrawals += Number(data.amount || 0);
  });

  document.getElementById("totalDeposits").innerText = `$${totalDeposits.toLocaleString()}`;
  document.getElementById("totalWithdrawals").innerText = `$${totalWithdrawals.toLocaleString()}`;
}

// Sidebar navigation
const buttons = document.querySelectorAll(".sidebar-btn");
const sectionContent = document.getElementById("section-content");

buttons.forEach(btn => {
  btn.addEventListener("click", async () => {
    const section = btn.dataset.section;
    sectionContent.innerHTML = `<p class="text-gray-400 py-10 text-center">Loading ${section}...</p>`;

    if(section === "dashboard") {
      loadDashboard();
      sectionContent.innerHTML = `<p class="text-green-400 font-bold text-center">Dashboard Loaded</p>`;
    }

    if(section === "users") {
      const usersSnap = await getDocs(collection(db, "users"));
      let html = `<table class="w-full text-left border-collapse"><tr><th class="border-b p-2">Username</th><th class="border-b p-2">Email</th></tr>`;
      usersSnap.forEach(doc => {
        const data = doc.data();
        html += `<tr><td class="p-2">${data.username}</td><td class="p-2">${data.email}</td></tr>`;
      });
      html += `</table>`;
      sectionContent.innerHTML = html;
    }

    // Add more sections for KYC, deposits, withdrawals, crypto-assets later
  });
});

// Initial dashboard load
loadDashboard();