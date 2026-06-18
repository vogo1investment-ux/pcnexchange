import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
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

document.addEventListener("DOMContentLoaded", () => {

  const btn = document.getElementById("loadRequestsBtn");
  const container = document.getElementById("requestsContainer");

  if (!btn || !container) {
    console.error("Required elements not found");
    return;
  }

  // Check authentication and admin status
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      container.innerHTML = `<p style="color:red;">Please log in to access admin panel.</p>`;
      btn.disabled = true;
      return;
    }

    if (user.uid !== ADMIN_UID) {
      container.innerHTML = `<p style="color:red;">Access Denied. Admin only.</p>`;
      btn.disabled = true;
      console.warn("Non-admin user attempted to access admin panel");
      return;
    }

    // User is admin → enable button
    btn.disabled = false;
    console.log("Admin access granted");
  });

  btn.addEventListener("click", async () => {

    container.innerHTML = "Loading...";

    try {
      const snap = await getDocs(collection(db, "pendingTransactions"));

      container.innerHTML = "";

      if (snap.empty) {
        container.innerHTML = "No pending transactions found.";
        return;
      }

      snap.forEach(docSnap => {
        const data = docSnap.data();

        const div = document.createElement("div");
        div.style.padding = "10px";
        div.style.margin = "10px";
        div.style.border = "1px solid #00ff88";
        div.style.borderRadius = "5px";

        div.innerHTML = `
          <p><strong>User ID:</strong> ${data.userId || 'N/A'}</p>
          <p><strong>Coin:</strong> ${data.coinId || 'N/A'}</p>
          <p><strong>Amount:</strong> ${data.amount || 'N/A'}</p>
          <p><strong>Status:</strong> ${data.status || 'N/A'}</p>
          <p><small>Doc ID: ${docSnap.id}</small></p>
        `;

        container.appendChild(div);
      });

    } catch (error) {
      console.error(error);
      container.innerHTML = `Error: ${error.message}`;
    }
  });
});
</script>