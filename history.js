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
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const historyDiv = document.getElementById("history");
const tabs = document.querySelectorAll(".tab");

let currentType = "all";
let userId = null;

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    currentType = tab.dataset.type;
    loadHistory();
  });
});

onAuthStateChanged(auth, (user) => {
  if (!user) return (window.location.href = "login.html");
  userId = user.uid;
  loadHistory();
});

function loadHistory() {
  historyDiv.innerHTML = "Loading...";

  const q = query(
    collection(db, "users", userId, "transactions"),
    orderBy("timestamp", "desc")
  );

  onSnapshot(q, (snap) => {
    historyDiv.innerHTML = "";

    if (snap.empty) {
      historyDiv.innerHTML = "No transactions yet";
      return;
    }

    snap.forEach(doc => {
      const d = doc.data();

      const type = (d.type || "").toLowerCase();

      if (currentType !== "all" && !type.includes(currentType)) return;

      const time = d.timestamp?.toDate?.() || new Date();

      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <div class="type">${d.type || "transaction"}</div>
        <div>Amount: ${d.amount || "-"}</div>
        <div>Method: ${d.method || "-"}</div>
        <div>Status: ${d.status || "pending"}</div>
        <div class="small">${time.toLocaleString()}</div>
      `;

      historyDiv.appendChild(div);
    });
  });
}