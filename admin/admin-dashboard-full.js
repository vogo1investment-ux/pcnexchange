import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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
  btn.addEventListener("click", () => loadSection(btn.dataset.section));
});

// Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "/admin/admin-login.html";
});

// Admin auth check
onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    window.location.href = "/admin/admin-login.html";
  } else {
    loadDashboardStats();
  }
});

// Load dashboard stats
async function loadDashboardStats() {
  const usersSnap = await getDocs(collection(db, "users"));
  document.getElementById("totalUsers").innerText = usersSnap.size;

  let totalDeposits = 0, totalWithdrawals = 0;
  usersSnap.forEach(docSnap => {
    const u = docSnap.data();
    totalDeposits += u.availableBalance || 0;
    totalWithdrawals += u.withdrawableBalance || 0;
  });

  document.getElementById("totalDeposits").innerText = `$${totalDeposits.toLocaleString()}`;
  document.getElementById("totalWithdrawals").innerText = `$${totalWithdrawals.toLocaleString()}`;
}

// Load sidebar sections
function loadSection(section) {
  sectionContent.innerHTML = `<p class="text-white font-bold">Loading ${section}...</p>`;
  switch (section) {
    case "dashboard": loadDashboardStats(); break;
    case "users": loadUsers(); break;
    case "kyc": loadKYC(); break;
    case "crypto-assets": loadCryptoAssets(); break;
    case "trades": loadTrades(); break;
    case "notifications": loadNotifications(); break;
    default: sectionContent.innerHTML = `<p>${section} not implemented yet</p>`;
  }
}

// ---------------- Users ----------------
async function loadUsers() {
  const usersSnap = await getDocs(collection(db, "users"));
  let html = `<h2 class="text-emerald-400 font-bold mb-4">Users</h2><table class="w-full text-white border-collapse">
              <tr><th>Email</th><th>Username</th><th>Balance</th><th>Referral</th><th>Edit</th></tr>`;
  usersSnap.forEach(docSnap => {
    const u = docSnap.data();
    html += `<tr class="border-t border-zinc-700">
      <td>${u.email}</td>
      <td>${u.username}</td>
      <td>$${u.availableBalance}</td>
      <td>${u.username}</td>
      <td><button onclick="editUser('${docSnap.id}')">Edit</button></td>
    </tr>`;
  });
  html += `</table>`;
  sectionContent.innerHTML = html;
}

window.editUser = async (uid) => {
  const ref = doc(db, "users", uid);
  const snap = await ref.get();
  const username = prompt("Username", snap.data().username);
  const balance = prompt("Balance", snap.data().availableBalance || "0.00000000");
  await updateDoc(ref, { username, availableBalance: parseFloat(balance) });
  loadUsers();
};

// ---------------- KYC ----------------
async function loadKYC() {
  const kycSnap = await getDocs(collection(db, "kyc"));
  let html = `<h2 class="text-emerald-400 font-bold mb-4">KYC Requests</h2>`;
  kycSnap.forEach(docSnap => {
    const k = docSnap.data();
    html += `<div class="bg-zinc-800 p-4 rounded-xl mb-2">
      <p><strong>${k.username}</strong> - ${k.status}</p>
      <button class="approve-btn" onclick="updateKYC('${docSnap.id}','Approved')">Approve</button>
      <button class="reject-btn" onclick="updateKYC('${docSnap.id}','Rejected')">Reject</button>
    </div>`;
  });
  sectionContent.innerHTML = html;
}

window.updateKYC = async (id, status) => {
  await updateDoc(doc(db, "kyc", id), { status });
  loadKYC();
};

// ---------------- Crypto Assets ----------------
async function loadCryptoAssets() {
  const coinsSnap = await getDocs(collection(db, "coins"));
  let html = `<h2 class="text-emerald-400 font-bold mb-4">Coins</h2>`;
  coinsSnap.forEach(docSnap => {
    const c = docSnap.data();
    html += `<div class="bg-zinc-800 p-4 rounded-xl mb-2">
      <p><strong>${c.name}</strong> - $${c.price} <br>${c.description}</p>
    </div>`;
  });
  sectionContent.innerHTML = html;
}

// ---------------- Pending Trades ----------------
async function loadTrades() {
  const tradesSnap = await getDocs(collection(db, "pendingTrades"));
  let html = `<h2 class="text-emerald-400 font-bold mb-4">Pending Trades</h2>`;
  tradesSnap.forEach(docSnap => {
    const t = docSnap.data();
    html += `<div class="bg-zinc-800 p-4 rounded-xl mb-2">
      <p>${t.userId} wants to ${t.type} ${t.amount} ${t.coin}</p>
      <button onclick="updateTrade('${docSnap.id}','Approved')">Approve</button>
      <button onclick="updateTrade('${docSnap.id}','Rejected')">Reject</button>
    </div>`;
  });
  sectionContent.innerHTML = html;
}

window.updateTrade = async (id, status) => {
  await updateDoc(doc(db, "pendingTrades", id), { status });
  loadTrades();
};

// ---------------- Notifications ----------------
async function loadNotifications() {
  sectionContent.innerHTML = `<h2 class="text-emerald-400 font-bold mb-4">Send Notification</h2>
    <input id="notifyUser" placeholder="UID (leave blank for all)" class="w-full p-2 mb-2 rounded bg-zinc-800">
    <textarea id="notifyMessage" placeholder="Message" class="w-full p-2 mb-2 rounded bg-zinc-800"></textarea>
    <button id="sendNotifyBtn" class="bg-emerald-400 p-2 rounded">Send</button>`;
  
  document.getElementById("sendNotifyBtn").addEventListener("click", async () => {
    const uid = document.getElementById("notifyUser").value.trim();
    const msg = document.getElementById("notifyMessage").value.trim();
    if(!msg) return alert("Enter a message");

    if(uid) {
      await addDoc(collection(db, "notifications"), { userId: uid, message: msg, createdAt: Date.now() });
    } else {
      await addDoc(collection(db, "notifications"), { userId: null, message: msg, createdAt: Date.now() });
    }

    alert("Notification sent!");
    document.getElementById("notifyMessage").value = "";
    document.getElementById("notifyUser").value = "";
  });
}