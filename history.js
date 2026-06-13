import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { 
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

// ======================
// TAB CLICK
// ======================
tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentType = btn.dataset.type;

    tabButtons.forEach(b => b.classList.remove("bg-emerald-500"));
    btn.classList.add("bg-emerald-500");

    if (currentUser) loadTransactions(currentUser.uid);
  });
});

// ======================
// AUTH
// ======================
onAuthStateChanged(auth, user => {
  if (!user) {
    alert("Login required");
    window.location.href = "login.html";
    return;
  }

  currentUser = user;
  loadTransactions(user.uid);
});

// ======================
// REALTIME LOAD (FIXED)
// ======================
function loadTransactions(uid) {
  historyTableBody.innerHTML =
    `<tr><td colspan="5" class="p-4 text-center">Loading...</td></tr>`;

  const q = query(
    collection(db, "pendingTransactions"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc")
  );

  // 🔥 REALTIME LISTENER (IMPORTANT FIX)
  onSnapshot(q, snapshot => {
    if (snapshot.empty) {
      historyTableBody.innerHTML =
        `<tr><td colspan="5" class="p-4 text-center">No transactions found</td></tr>`;
      return;
    }

    let rows = [];

    snapshot.forEach(docSnap => {
      const t = docSnap.data();
      const type = (t.type || "").toLowerCase();

      let match = false;

      if (currentType === "deposit" && type.includes("deposit")) match = true;
      if (currentType === "withdrawal" && type.includes("withdraw")) match = true;
      if (currentType === "stake" && type.includes("stake")) match = true;
      if (currentType === "transfer" && type.includes("transfer")) match = true;
      if (currentType === "received" && type.includes("received")) match = true;

      if (!match) return;

      const date = t.createdAt?.toDate ? t.createdAt.toDate() : new Date();

      rows.push(`
        <tr class="bg-zinc-900 hover:bg-zinc-800">
          <td class="p-2 border border-zinc-700">${t.type || "-"}</td>
          <td class="p-2 border border-zinc-700">${t.amount || 0}</td>
          <td class="p-2 border border-zinc-700">${t.method || "-"}</td>
          <td class="p-2 border border-zinc-700">${t.status || "Pending"}</td>
          <td class="p-2 border border-zinc-700">${date.toLocaleString()}</td>
        </tr>
      `);
    });

    if (rows.length === 0) {
      historyTableBody.innerHTML =
        `<tr><td colspan="5" class="p-4 text-center">No ${currentType} transactions</td></tr>`;
      return;
    }

    historyTableBody.innerHTML = rows.join("");
  }, error => {
    console.error(error);
    historyTableBody.innerHTML =
      `<tr><td colspan="5" class="p-4 text-center text-red-500">Failed to load transactions</td></tr>`;
  });
}