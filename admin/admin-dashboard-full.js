import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, updateDoc, addDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

// Sidebar buttons
document.querySelectorAll(".sidebar-btn").forEach(btn => {
  btn.addEventListener("click", () => loadSection(btn.dataset.section));
});

// Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "/admin/admin-login.html";
});

// Check admin auth
onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    window.location.href = "/admin/admin-login.html";
  }
});

// Load sections
function loadSection(section) {
  sectionContent.innerHTML = `<p>Loading ${section}...</p>`;
  switch(section) {
    case "wallet": loadWallet(); break;
    case "trade": sectionContent.innerHTML="<p>Trade Section (Coming)</p>"; break;
    case "markets": sectionContent.innerHTML="<p>Markets Section (Coming)</p>"; break;
    case "transfer": sectionContent.innerHTML="<p>Transfer Section (Coming)</p>"; break;
    case "receive": sectionContent.innerHTML="<p>Receive Section (Coming)</p>"; break;
    case "history": sectionContent.innerHTML="<p>History Section (Coming)</p>"; break;
    case "support": sectionContent.innerHTML="<p>Support Section (Coming)</p>"; break;
    case "airdrop": sectionContent.innerHTML="<p>Airdrop Section (Coming)</p>"; break;
    case "explore": sectionContent.innerHTML="<p>Explore Section (Coming)</p>"; break;
    case "crypto-assets": loadCryptoAssets(); break;
    default: sectionContent.innerHTML="<p>Not implemented</p>";
  }
}

// Example: Load Wallet
async function loadWallet() {
  const usersSnap = await getDocs(collection(db, "users"));
  let html = "<h2 class='text-emerald-400 font-bold mb-2'>Users Wallets</h2><ul>";
  usersSnap.forEach(docSnap => {
    const u = docSnap.data();
    html += `<li><strong>${u.username}</strong>: $${u.availableBalance || 0}</li>`;
  });
  html += "</ul>";
  sectionContent.innerHTML = html;
}

// Example: Load Crypto Assets
async function loadCryptoAssets() {
  const coinsSnap = await getDocs(collection(db, "coins"));
  let html = "<h2 class='text-emerald-400 font-bold mb-2'>Crypto Assets</h2><ul>";
  coinsSnap.forEach(docSnap => {
    const c = docSnap.data();
    html += `<li><strong>${c.name}</strong>: $${c.price} <br>${c.description || ""}</li>`;
  });
  html += "</ul>";
  sectionContent.innerHTML = html;
}