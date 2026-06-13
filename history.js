import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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

const table = document.getElementById("historyTableBody");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  loadHistory(user.uid);
});

function loadHistory(uid) {
  const q = query(
    collection(db, "users", uid, "transactions"),
    orderBy("timestamp", "desc")
  );

  onSnapshot(q, (snapshot) => {
    table.innerHTML = "";

    if (snapshot.empty) {
      table.innerHTML = `
        <tr><td colspan="5" style="text-align:center;">No history found</td></tr>
      `;
      return;
    }

    snapshot.forEach((doc) => {
      const t = doc.data();

      const date = t.timestamp?.toDate?.() || new Date();

      table.innerHTML += `
        <tr>
          <td>${t.type || "-"}</td>
          <td>${t.amount || "-"}</td>
          <td>${t.method || "-"}</td>
          <td>${t.status || "-"}</td>
          <td>${date.toLocaleString()}</td>
        </tr>
      `;
    });
  }, (error) => {
    console.log("ERROR LOADING HISTORY:", error);
    table.innerHTML = `
      <tr><td colspan="5" style="color:red;text-align:center;">
        Failed to load history
      </td></tr>
    `;
  });
}