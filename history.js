import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

const historyTableBody = document.getElementById("historyTableBody");
const tabButtons = document.querySelectorAll(".tab-btn");

let currentType = "deposit";
let currentUser = null;

// =========================
// TAB SWITCH
// =========================
tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentType = btn.dataset.type;

    tabButtons.forEach(b => b.classList.remove("bg-emerald-500"));
    btn.classList.add("bg-emerald-500");

    if (currentUser) loadTransactions(currentUser.uid);
  });
});

// =========================
// AUTH
// =========================
onAuthStateChanged(auth, async user => {
  if (!user) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  currentUser = user;
  loadTransactions(user.uid);
});

// =========================
// LOAD HISTORY (FIXED)
// =========================
async function loadTransactions(uid) {
  historyTableBody.innerHTML =
    `<tr><td colspan="5" class="p-4 text-center">Loading...</td></tr>`;

  try {
    // 🔥 READ GLOBAL COLLECTION (IMPORTANT FIX)
    const q = query(
      collection(db, "pendingTransactions"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      historyTableBody.innerHTML =
        `<tr><td colspan="5" class="p-4 text-center">No transactions found</td></tr>`;
      return;
    }

    const txns = [];

    snap.forEach(docSnap => {
      const t = docSnap.data();
      if (!t.type) return;

      const type = (t.type || "").toLowerCase();

      // =========================
      // FILTER FIXED
      // =========================
      if (
        (currentType === "deposit" && type.includes("deposit")) ||
        (currentType === "withdrawal" && type.includes("withdraw")) ||
        (currentType === "stake" && type.includes("stake")) ||
        (currentType === "transfer" && type.includes("transfer") && !type.includes("received")) ||
        (currentType === "received" && type.includes("received"))
      ) {
        txns.push(t);
      }
    });

    if (txns.length === 0) {
      historyTableBody.innerHTML =
        `<tr><td colspan="5" class="p-4 text-center">No ${currentType} transactions</td></tr>`;
      return;
    }

    // =========================
    // RENDER
    // =========================
    historyTableBody.innerHTML = "";

    txns.forEach(t => {
      let date = t.createdAt?.toDate
        ? t.createdAt.toDate()
        : new Date();

      historyTableBody.innerHTML += `
        <tr class="bg-zinc-900 hover:bg-zinc-800">
          <td class="p-2 border border-zinc-700">${t.type || "-"}</td>
          <td class="p-2 border border-zinc-700">${t.amount || 0}</td>
          <td class="p-2 border border-zinc-700">${t.method || "-"}</td>
          <td class="p-2 border border-zinc-700">${t.status || "Pending"}</td>
          <td class="p-2 border border-zinc-700">${date.toLocaleString()}</td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("HISTORY ERROR:", err);
    historyTableBody.innerHTML =
      `<tr><td colspan="5" class="p-4 text-center text-red-500">Failed to load transactions</td></tr>`;
  }
}