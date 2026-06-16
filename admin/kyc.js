import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  updateDoc
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

const container = document.getElementById("kycContainer");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    container.innerHTML = "❌ Please login as admin";
    return;
  }

  if (user.uid !== ADMIN_UID) {
    container.innerHTML = "⛔ Access denied";
    return;
  }

  loadKYC();
});

function loadKYC() {

  const kycRef = collection(db, "kyc");

  onSnapshot(kycRef, (snapshot) => {

    container.innerHTML = "";

    if (snapshot.empty) {
      container.innerHTML = "No KYC submissions found.";
      return;
    }

    snapshot.forEach((docSnap) => {

      const data = docSnap.data();

      const statusClass =
        data.status === "approved" ? "approved" :
        data.status === "rejected" ? "rejected" : "pending";

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <h3>${data.fullName || "No Name"}</h3>

        <p>Email: ${data.email || "N/A"}</p>
        <p>Phone: ${data.phone || "N/A"}</p>
        <p>UID: ${data.uid || "N/A"}</p>
        <p>ID Number: ${data.idNumber || "N/A"}</p>

        <div class="badge ${statusClass}">
          ${data.status || "pending"}
        </div>

        <img src="${data.idImage || ''}" />

        <select>
          <option value="pending">Pending</option>
          <option value="approved">Approve</option>
          <option value="rejected">Reject</option>
        </select>

        <button>Update Status</button>
      `;

      const select = card.querySelector("select");
      const btn = card.querySelector("button");

      select.value = data.status || "pending";

      btn.onclick = async () => {
        try {
          await updateDoc(doc(db, "kyc", docSnap.id), {
            status: select.value
          });

          alert("KYC updated successfully");
        } catch (err) {
          console.error(err);
          alert("Update failed");
        }
      };

      container.appendChild(card);
    });

  }, (error) => {
    console.error(error);
    container.innerHTML = "Error loading KYC data.";
  });
}