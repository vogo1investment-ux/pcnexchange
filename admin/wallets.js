import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collectionGroup,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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

const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";
const container = document.getElementById("historyContainer");

let currentType = "all";

/**
 * REAL TIME ADMIN HISTORY
 */
onAuthStateChanged(auth, (user) => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Admin only");
    window.location.href = "login.html";
    return;
  }

  loadHistory();
});

function loadHistory() {
  container.innerHTML = "Loading...";

  const q = query(
    collectionGroup(db, "transactions"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {
    container.innerHTML = "";

    if (snapshot.empty) {
      container.innerHTML = "<p>No transactions found</p>";
      return;
    }

    snapshot.forEach((docSnap) => {
      const d = docSnap.data();

      const type = (d.type || "").toLowerCase();

      // filter tabs
      if (currentType !== "all" && !type.includes(currentType)) return;

      const date = d.createdAt?.toDate?.() || new Date();

      const box = document.createElement("div");
      box.className = "p-3 bg-zinc-900 border border-zinc-700 rounded-xl mb-3";

      box.innerHTML = `
        <p><b>Type:</b> ${d.type || "-"}</p>
        <p><b>User:</b> ${d.userId || "-"}</p>
        <p><b>Amount:</b> ${d.amount || "-"}</p>
        <p><b>Method:</b> ${d.method || "-"}</p>
        <p><b>Status:</b> ${d.status || "-"}</p>
        <p class="text-xs text-gray-400">${date.toLocaleString()}</p>
      `;

      container.appendChild(box);
    });
  });
}

/**
 * TAB FILTER SUPPORT
 */
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentType = btn.dataset.type.toLowerCase();

    document.querySelectorAll(".tab-btn").forEach(b =>
      b.classList.remove("bg-green-500")
    );
    btn.classList.add("bg-green-500");

    loadHistory();
  });
});