import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where, doc, updateDoc, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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
alert("Access Denied. Admin only.");
window.location.href = "admin-login.html";
return;
}
attachButtonEvents();
updateSummaryCards();
});

function attachButtonEvents() {

document.querySelectorAll(".admin-btn").forEach(btn => {

btn.onclick = async function() {

  const section = this.dataset.section;

  try {

    sectionContent.innerHTML =
    "<div style='padding:20px;color:#00ff88'>Loading...</div>";

    // Transactions
    if(section === "transactions"){
      const html = await (await fetch("admin-transactions.html")).text();
      sectionContent.innerHTML = html;

      const script = document.createElement("script");
      script.type = "module";
      script.src = "admin-transactions.js";
      document.body.appendChild(script);
      return;
    }

    // Stake Overview
    if(section === "stake-overview"){
      const html = await (await fetch("stake-overview.html")).text();
      sectionContent.innerHTML = html;

      const script = document.createElement("script");
      script.type = "module";
      script.src = "stake-overview.js";
      document.body.appendChild(script);
      return;
    }

    // Coin Import
    if(section === "coin-import"){
      const html = await (await fetch("coin-import.html")).text();
      sectionContent.innerHTML = html;

      const script = document.createElement("script");
      script.type = "module";
      script.src = "coin-import.js";
      document.body.appendChild(script);
      return;
    }

    // Notification
    if(section === "send-notification"){
      const html = await (await fetch("notification.html")).text();
      sectionContent.innerHTML = html;

      const script = document.createElement("script");
      script.type = "module";
      script.src = "notification.js";
      document.body.appendChild(script);
      return;
    }

    // Default Pages
    const html = await (await fetch(section + ".html")).text();
    sectionContent.innerHTML = html;

    const script = document.createElement("script");
    script.type = "module";
    script.src = section + ".js";
    document.body.appendChild(script);

  } catch(error){

    console.error(error);

    sectionContent.innerHTML =
    "<div style='padding:20px;color:red'>Failed to load " +
    section +
    "</div>";
  }

};

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
