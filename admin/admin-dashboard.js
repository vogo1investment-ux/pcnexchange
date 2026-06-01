import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

// --- Section switching ---
document.querySelectorAll('nav button[data-section]').forEach(btn => {
  btn.addEventListener('click', () => {
    const sectionId = btn.dataset.section;
    document.querySelectorAll('section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
  });
});

// --- Logout ---
document.getElementById("logoutBtn").addEventListener("click", async ()=>{
  await signOut(auth);
  window.location.href = "admin-login.html";
});

// --- Persistent session & admin-only ---
const adminUID = "YOUR_ADMIN_UID"; // replace with your admin UID

onAuthStateChanged(auth, user => {
  if(!user || user.uid !== adminUID){
    alert("Unauthorized. Redirecting to login.");
    window.location.href = "admin-login.html";
  } else {
    loadDashboardStats();
    loadUsers();
    loadTransactions();
  }
});

// --- Load Dashboard stats ---
async function loadDashboardStats() {
  // Fetch totals and update dashboard cards
  const usersSnap = await getDocs(collection(db, "users"));
  document.getElementById("totalUsers").innerText = usersSnap.size;

  // You can also fetch deposits, withdrawals from transactions collection
  const txSnap = await getDocs(collection(db, "transactions"));
  let totalDeposits = 0, totalWithdrawals = 0;
  txSnap.forEach(tx => {
    if(tx.data().type==="deposit") totalDeposits += tx.data().amount;
    if(tx.data().type==="withdrawal") totalWithdrawals += tx.data().amount;
  });
  document.getElementById("totalDeposits").innerText = totalDeposits.toFixed(2);
  document.getElementById("totalWithdrawals").innerText = totalWithdrawals.toFixed(2);
}

// --- Load users ---
async function loadUsers() {
  const list = document.getElementById("usersList");
  list.innerHTML = "";
  const usersSnap = await getDocs(collection(db, "users"));
  usersSnap.forEach(u=>{
    const div = document.createElement("div");
    div.innerText = `${u.data().email || u.id} - Balance: ${u.data().totalBalance || 0}`;
    list.appendChild(div);
  });
}

// --- Load transactions ---
async function loadTransactions() {
  const list = document.getElementById("transactionsList");
  list.innerHTML = "";
  const txSnap = await getDocs(collection(db, "transactions"));
  txSnap.forEach(tx=>{
    const div = document.createElement("div");
    div.innerText = `${tx.data().userEmail || ""} - ${tx.data().type || ""} - ${tx.data().amount || 0} ${tx.data().coin || ""} - ${tx.data().status || ""}`;
    list.appendChild(div);
  });
}