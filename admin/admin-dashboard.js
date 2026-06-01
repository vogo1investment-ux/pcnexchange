import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, doc, getDocs, onSnapshot, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// Firebase configuration
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

// Sections
const sections = {
  adminSection: document.getElementById("adminSection"),
  usersSection: document.getElementById("usersSection"),
  transactionsSection: document.getElementById("transactionsSection"),
  coinsSection: document.getElementById("coinsSection"),
  airdropsSection: document.getElementById("airdropsSection"),
  supportSection: document.getElementById("supportSection"),
  notificationsSection: document.getElementById("notificationsSection"),
};

// Nav buttons
const navButtons = {
  btnUsers: sections.usersSection,
  btnTransactions: sections.transactionsSection,
  btnCoins: sections.coinsSection,
  btnAirdrops: sections.airdropsSection,
  btnSupport: sections.supportSection,
  btnNotifications: sections.notificationsSection,
};

// Switch section
Object.keys(navButtons).forEach(btnId => {
  document.getElementById(btnId).addEventListener("click", () => {
    Object.values(sections).forEach(sec => sec.style.display = "none");
    navButtons[btnId].style.display = "block";
  });
});

// Admin UID
const adminUID = "YOUR_ADMIN_UID"; // Replace with your admin UID

// Load data after authentication
onAuthStateChanged(auth, async user => {
  if (!user) {
    alert("Please login first");
    window.location.href = "index.html";
    return;
  }
  if (user.uid !== adminUID) {
    alert("You are not authorized as admin");
    return;
  }

  loadUsers();
  loadTransactions();
  loadCoins();
  loadAirdrops();
  loadSupport();
  setupNotifications();
});

// -------------------- USERS --------------------
async function loadUsers() {
  const usersTableBody = document.querySelector("#usersTable tbody");
  const snapshot = await getDocs(collection(db, "users"));
  usersTableBody.innerHTML = "";
  snapshot.forEach(docSnap => {
    const user = docSnap.data();
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.email || ""}</td>
      <td>${docSnap.id}</td>
      <td>${user.totalBalance || 0}</td>
      <td>
        <button onclick="editBalance('${docSnap.id}')">Edit Balance</button>
      </td>
    `;
    usersTableBody.appendChild(row);
  });
}

window.editBalance = async (uid) => {
  const newBalance = prompt("Enter new total balance:");
  if (!newBalance) return;
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { totalBalance: parseFloat(newBalance) });
  alert("Balance updated");
};

// -------------------- TRANSACTIONS --------------------
async function loadTransactions() {
  const table = document.querySelector("#transactionsTable tbody");
  const col = collection(db, "transactions");
  onSnapshot(col, snap => {
    table.innerHTML = "";
    snap.forEach(docSnap => {
      const tx = docSnap.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${tx.userEmail || ""}</td>
        <td>${tx.type || ""}</td>
        <td>${tx.coin || ""}</td>
        <td>${tx.amount || 0}</td>
        <td>${tx.status || ""}</td>
        <td>
          ${tx.status === "pending" ? `<button onclick="approveTx('${docSnap.id}')">Approve</button>` : ""}
        </td>
      `;
      table.appendChild(row);
    });
  });
}

window.approveTx = async (txId) => {
  const txRef = doc(db, "transactions", txId);
  await updateDoc(txRef, { status: "approved" });
  alert("Transaction approved");
};

// -------------------- COINS --------------------
async function loadCoins() {
  const table = document.querySelector("#coinsTable tbody");
  const col = collection(db, "coins");
  onSnapshot(col, snap => {
    table.innerHTML = "";
    snap.forEach(docSnap => {
      const coin = docSnap.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${coin.name}</td>
        <td>${coin.symbol}</td>
        <td>${coin.price}</td>
        <td><button onclick="editCoin('${docSnap.id}')">Edit Price</button></td>
      `;
      table.appendChild(row);
    });
  });
}

window.editCoin = async (coinId) => {
  const newPrice = prompt("Enter new coin price:");
  if (!newPrice) return;
  const coinRef = doc(db, "coins", coinId);
  await updateDoc(coinRef, { price: parseFloat(newPrice) });
  alert("Coin price updated");
};

// -------------------- AIRDROPS --------------------
async function loadAirdrops() {
  const table = document.querySelector("#airdropsTable tbody");
  const col = collection(db, "airdrops");
  onSnapshot(col, snap => {
    table.innerHTML = "";
    snap.forEach(docSnap => {
      const ad = docSnap.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${ad.coinName}</td>
        <td>${ad.symbol}</td>
        <td>${ad.startDate ? new Date(ad.startDate).toLocaleString() : ""}</td>
        <td>${ad.endDate ? new Date(ad.endDate).toLocaleString() : ""}</td>
        <td>${ad.status || ""}</td>
        <td><button onclick="editAirdrop('${docSnap.id}')">Edit</button></td>
      `;
      table.appendChild(row);
    });
  });
}

window.editAirdrop = async (adId) => {
  const adRef = doc(db, "airdrops", adId);
  const startDate = prompt("Enter new start date timestamp:");
  const endDate = prompt("Enter new end date timestamp:");
  const price = prompt("Enter price per coin:");
  await updateDoc(adRef, {
    startDate: parseInt(startDate),
    endDate: parseInt(endDate),
    pricePerCoin: parseFloat(price)
  });
  alert("Airdrop updated");
};

// -------------------- SUPPORT --------------------
async function loadSupport() {
  const table = document.querySelector("#supportTable tbody");
  const col = collection(db, "supportMessages");
  onSnapshot(col, snap => {
    table.innerHTML = "";
    snap.forEach(docSnap => {
      const msg = docSnap.data();
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${msg.userEmail || ""}</td>
        <td>${msg.subject || ""}</td>
        <td>${msg.message || ""}</td>
        <td>${msg.reply || ""}</td>
        <td><button onclick="replySupport('${docSnap.id}')">Reply</button></td>
      `;
      table.appendChild(row);
    });
  });
}

window.replySupport = async (msgId) => {
  const reply = prompt("Enter your reply:");
  if(!reply) return;
  const msgRef = doc(db, "supportMessages", msgId);
  await updateDoc(msgRef, { reply });
  alert("Reply sent");
};

// -------------------- NOTIFICATIONS --------------------
function setupNotifications() {
  document.getElementById("sendNotificationBtn").addEventListener("click", async ()=>{
    const message = document.getElementById("notificationMessage").value.trim();
    if(!message) return alert("Enter a message first");
    try {
      const usersSnap = await getDocs(collection(db, "users"));
      const batch = db.batch();
      usersSnap.forEach(userDoc => {
        const notifRef = doc(collection(db, "users", userDoc.id, "notifications"));
        batch.set(notifRef, { message, timestamp: Date.now(), read: false });
      });
      await batch.commit();
      document.getElementById("notificationStatus").innerText = "Notification sent to all users!";
      document.getElementById("notificationMessage").value = "";
    } catch(e){
      console.error(e);
      alert("Failed to send notification");
    }
  });
}