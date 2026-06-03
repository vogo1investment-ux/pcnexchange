import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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
const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

const sectionContent = document.getElementById("section-content");
const logoutBtn = document.getElementById("logoutBtn");

// Sidebar navigation
document.querySelectorAll(".sidebar-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const section = btn.dataset.section;
    loadSection(section);
  });
});

// Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "/admin-login.html";
});

// Redirect if not admin
onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    window.location.href = "/admin-login.html";
  } else {
    loadDashboardStats();
  }
});

// Load Dashboard Stats
async function loadDashboardStats() {
  const usersSnap = await getDocs(collection(db, "users"));
  document.getElementById("totalUsers").innerText = usersSnap.size;

  let totalDeposits = 0, totalWithdrawals = 0;
  usersSnap.forEach(docSnap => {
    const data = docSnap.data();
    totalDeposits += data.availableBalance || 0;
    totalWithdrawals += data.withdrawableBalance || 0;
  });
  document.getElementById("totalDeposits").innerText = "$" + totalDeposits.toLocaleString();
  document.getElementById("totalWithdrawals").innerText = "$" + totalWithdrawals.toLocaleString();
}

// Load sections
function loadSection(section) {
  sectionContent.innerHTML = `<p class="text-white font-bold">Loading ${section}...</p>`;
  switch(section) {
    case "users":
      loadUsers();
      break;
    case "kyc":
      loadKYC();
      break;
    case "deposits":
      loadDeposits();
      break;
    case "withdrawals":
      loadWithdrawals();
      break;
    case "crypto-assets":
      loadCryptoAssets();
      break;
    case "trades":
      loadTrades();
      break;
    case "notifications":
      loadNotifications();
      break;
    default:
      sectionContent.innerHTML = `<p>Select a section to view.</p>`;
  }
}

// Users
async function loadUsers() {
  const usersSnap = await getDocs(collection(db, "users"));
  let html = `<h2 class="text-emerald-400 font-bold mb-4">All Users</h2><table class="w-full text-white border-collapse">`;
  html += `<tr><th>Email</th><th>Username</th><th>Balance</th><th>Referral Code</th></tr>`;
  usersSnap.forEach(docSnap => {
    const u = docSnap.data();
    html += `<tr class="border-t border-zinc-700"><td>${u.email}</td><td>${u.username}</td><td>$${u.availableBalance}</td><td>${u.username}</td></tr>`;
  });
  html += `</table>`;
  sectionContent.innerHTML = html;
}

// KYC
async function loadKYC() {
  const kycSnap = await getDocs(collection(db, "kyc"));
  let html = `<h2 class="text-emerald-400 font-bold mb-4">KYC Requests</h2>`;
  kycSnap.forEach(docSnap => {
    const k = docSnap.data();
    html += `<div class="bg-zinc-800 p-4 rounded-xl mb-2">
      <p><strong>${k.username}</strong> - ${k.status}</p>
      <button class="approve-btn bg-emerald-400 p-2 rounded mr-2" data-id="${docSnap.id}">Approve</button>
      <button class="reject-btn bg-red-500 p-2 rounded" data-id="${docSnap.id}">Reject</button>
    </div>`;
  });
  sectionContent.innerHTML = html;

  document.querySelectorAll(".approve-btn").forEach(btn => {
    btn.addEventListener("click", async e => {
      await updateDoc(doc(db, "kyc", e.target.dataset.id), {status:"Approved"});
      loadKYC();
    });
  });
  document.querySelectorAll(".reject-btn").forEach(btn => {
    btn.addEventListener("click", async e => {
      await updateDoc(doc(db, "kyc", e.target.dataset.id), {status:"Rejected"});
      loadKYC();
    });
  });
}

// Crypto Assets
async function loadCryptoAssets() {
  const coinsSnap = await getDocs(collection(db, "coins"));
  let html = `<h2 class="text-emerald-400 font-bold mb-4">Crypto Assets</h2>`;
  coinsSnap.forEach(docSnap => {
    const c = docSnap.data();
    html += `<div class="bg-zinc-800 p-4 rounded-xl mb-2">
      <p><strong>${c.name}</strong> - $${c.price} <br>${c.description}</p>
    </div>`;
  });
  sectionContent.innerHTML = html;
}

// Trades
async function loadTrades() {
  const tradesSnap = await getDocs(collection(db, "pendingTrades"));
  let html = `<h2 class="text-emerald-400 font-bold mb-4">Pending Trades</h2>`;
  tradesSnap.forEach(docSnap => {
    const t = docSnap.data();
    html += `<div class="bg-zinc-800 p-4 rounded-xl mb-2">
      <p>${t.username} wants to ${t.type} ${t.amount} of ${t.coin}</p>
      <button class="approve-trade bg-emerald-400 p-2 rounded mr-2" data-id="${docSnap.id}">Approve</button>
      <button class="reject-trade bg-red-500 p-2 rounded" data-id="${docSnap.id}">Reject</button>
    </div>`;
  });
  sectionContent.innerHTML = html;

  document.querySelectorAll(".approve-trade").forEach(btn=>{
    btn.addEventListener("click", async e=>{
      await updateDoc(doc(db,"pendingTrades", e.target.dataset.id), {status:"Approved"});
      loadTrades();
    });
  });
  document.querySelectorAll(".reject-trade").forEach(btn=>{
    btn.addEventListener("click", async e=>{
      await updateDoc(doc(db,"pendingTrades", e.target.dataset.id), {status:"Rejected"});
      loadTrades();
    });
  });
}

// Notifications
async function loadNotifications() {
  sectionContent.innerHTML = `<h2 class="text-emerald-400 font-bold mb-4">Send Notification</h2>
    <input id="notifyUser" placeholder="UID or leave blank for all" class="w-full p-2 mb-2 rounded bg-zinc-800">
    <textarea id="notifyMessage" placeholder="Message" class="w-full p-2 mb-2 rounded bg-zinc-800"></textarea>
    <button id="sendNotifyBtn" class="bg-emerald-400 p-2 rounded">Send</button>`;

  document.getElementById("sendNotifyBtn").addEventListener("click", async ()=>{
    const uid = document.getElementById("notifyUser").value.trim();
    const msg = document.getElementById("notifyMessage").value.trim();
    if(!msg) return alert("Enter message");
    if(uid){
      await updateDoc(doc(db,"users",uid), {notification:msg});
    }else{
      const usersSnap = await getDocs(collection(db,"users"));
      for(const u of usersSnap.docs){
        await updateDoc(doc(db,"users",u.id), {notification:msg});
      }
    }
    alert("Notification sent!");
  });
}