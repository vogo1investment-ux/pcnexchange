import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Redirect if not admin
onAuthStateChanged(auth, (user) => {
  if (!user || user.uid !== "XphWRwjVK6NWEtHw9XeoNxXsfT12") {
    alert("Access Denied: Admin Only");
    window.location.href = "admin-login.html";
  } else {
    loadSummaryCards();
    initButtons();
  }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "admin-login.html";
});

// Load Summary Cards
async function loadSummaryCards() {
  const usersSnap = await getDocs(collection(db, "users"));
  document.getElementById("totalUsersCard").innerText = `Users: ${usersSnap.size}`;

  const pendingTxSnap = await getDocs(collection(db, "pendingTransactions"));
  const deposits = pendingTxSnap.docs.filter(doc => doc.data().type === "deposit").length;
  const withdrawals = pendingTxSnap.docs.filter(doc => doc.data().type === "withdraw").length;
  document.getElementById("totalDepositsCard").innerText = `Deposits: $${deposits}`;
  document.getElementById("totalWithdrawalsCard").innerText = `Withdrawals: $${withdrawals}`;

  const pendingTradesSnap = await getDocs(collection(db, "pendingTrades"));
  document.getElementById("pendingTradesCard").innerText = `Pending Trades: ${pendingTradesSnap.size}`;

  const pendingKycSnap = await getDocs(collection(db, "kyc"));
  document.getElementById("pendingKycCard").innerText = `KYC Pending: ${pendingKycSnap.size}`;
}

// Initialize section buttons
function initButtons() {
  const buttons = document.querySelectorAll(".admin-btn");
  const sectionContent = document.getElementById("section-content");

  buttons.forEach(btn => {
    btn.addEventListener("click", async () => {
      const section = btn.getAttribute("data-section");
      if (!sectionContent) return;

      switch (section) {
        case "overview":
          sectionContent.innerHTML = "<p>Overview Section Loaded</p>";
          break;
        case "notify-users":
          sectionContent.innerHTML = `
            <h2>Send Notification</h2>
            <input type="text" id="notifTitle" placeholder="Title" />
            <textarea id="notifMessage" placeholder="Message"></textarea>
            <input type="text" id="notifUser" placeholder="User ID (leave empty for all)" />
            <input type="file" id="notifImage" />
            <button id="sendNotifBtn">Send Notification</button>
          `;
          initNotifyUsers();
          break;
        default:
          sectionContent.innerHTML = `<p>${section} Section Loaded</p>`;
      }
    });
  });
}

// Notify Users section
function initNotifyUsers() {
  const sendBtn = document.getElementById("sendNotifBtn");
  if (!sendBtn) return;

  sendBtn.addEventListener("click", async () => {
    const title = document.getElementById("notifTitle").value.trim();
    const message = document.getElementById("notifMessage").value.trim();
    const userId = document.getElementById("notifUser").value.trim() || "all";
    const imageFile = document.getElementById("notifImage").files[0];

    if (!title || !message) return alert("Title and Message are required");

    let imageUrl = "";
    if (imageFile) {
      const { getStorage, ref, uploadBytes, getDownloadURL } = await import("https://www.gstatic.com/firebasejs/12.14.0/firebase-storage.js");
      const storage = getStorage();
      const storageRef = ref(storage, `notifications/${Date.now()}_${imageFile.name}`);
      const snap = await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(snap.ref);
    }

    try {
      await import("https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js").then(async ({ getFirestore, collection, addDoc, serverTimestamp }) => {
        const db = getFirestore();
        await addDoc(collection(db, "notifications"), { title, message, userId, imageUrl, createdAt: serverTimestamp() });
      });
      alert("Notification sent!");
      document.getElementById("notifTitle").value = "";
      document.getElementById("notifMessage").value = "";
      document.getElementById("notifUser").value = "";
      document.getElementById("notifImage").value = "";
    } catch (err) {
      console.error(err);
      alert("Failed to send notification");
    }
  });
}
