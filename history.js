import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
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

let currentType = "all";
let uid;

const container = document.getElementById("historyContainer");
const tabs = document.querySelectorAll(".tab");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentType = tab.dataset.type;
    loadHistory();
  });
});

onAuthStateChanged(auth, user => {
  if (!user) {
    alert("Login required");
    window.location.href = "login.html";
    return;
  }

  uid = user.uid;
  loadHistory();
});

function loadHistory() {
  container.innerHTML = `<p style="text-align:center;color:#aaa">Loading...</p>`;

  const q = query(
    collection(db, "users", uid, "transactions"),
    orderBy("timestamp", "desc")
  );

  onSnapshot(q, snap => {
    container.innerHTML = "";

    if (snap.empty) {
      container.innerHTML = `<p style="text-align:center;color:#aaa">No history found</p>`;
      return;
    }

    snap.forEach(doc => {
      const d = doc.data();

      const type = (d.type || "").toLowerCase();

      // FILTER LOGIC (fixed properly)
      if (currentType !== "all") {
        if (currentType === "deposit" && !type.includes("deposit")) return;
        if (currentType === "withdraw" && !type.includes("withdraw")) return;
        if (currentType === "stake" && !type.includes("stake")) return;
        if (currentType === "transfer" && !type.includes("transfer")) return;
        if (currentType === "received" && !type.includes("receive")) return;
      }

      const date = d.timestamp?.toDate?.() || new Date();

      container.innerHTML += `
        <div class="card">
          <div class="row">
            <div><b>${d.type || "Transaction"}</b></div>
            <div class="badge">${d.status || "pending"}</div>
          </div>

          <div class="row">
            <div>Amount: ${d.amount || 0}</div>
            <div>Method: ${d.method || "-"}</div>
          </div>

          <div class="row">
            <div>User: ${d.userId || uid}</div>
          </div>

          <div class="small">
            ${date.toLocaleString()}
          </div>
        </div>
      `;
    });
  }, err => {
    console.error(err);
    container.innerHTML = `<p style="color:red;text-align:center">Failed to load history</p>`;
  });
}