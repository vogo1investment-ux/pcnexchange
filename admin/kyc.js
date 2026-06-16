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

  console.log("AUTH USER:", user);

  if (!user) {
    container.innerHTML = "❌ Please login as admin";
    return;
  }

  if (user.uid !== ADMIN_UID) {
    container.innerHTML = "⛔ Access denied (not admin)";
    return;
  }

  loadKYC();
});

function loadKYC() {

  const kycRef = collection(db, "kyc");

  onSnapshot(kycRef, (snapshot) => {

    console.log("KYC SIZE:", snapshot.size);

    container.innerHTML = "";

    if (snapshot.empty) {
      container.innerHTML = "No KYC submissions found.";
      return;
    }

    snapshot.forEach((docSnap) => {

      const data = docSnap.data();

      const div = document.createElement("div");

      div.innerHTML = `
        <hr>

        <p>Name: ${data.fullName || "N/A"}</p>
        <p>Email: ${data.email || "N/A"}</p>
        <p>Phone: ${data.phone || "N/A"}</p>
        <p>UID: ${data.uid || "N/A"}</p>
        <p>ID Number: ${data.idNumber || "N/A"}</p>
        <p>Status: ${data.status || "pending"}</p>

        <img src="${data.idImage || ''}" width="180" />

        <br><br>

        <select>
          <option value="pending">Pending</option>
          <option value="approved">Approve</option>
          <option value="rejected">Reject</option>
        </select>

        <button>Update</button>
      `;

      const select = div.querySelector("select");
      const btn = div.querySelector("button");

      select.value = data.status || "pending";

      btn.onclick = async () => {
        try {
          await updateDoc(doc(db, "kyc", docSnap.id), {
            status: select.value
          });

          alert("KYC updated successfully");
        } catch (e) {
          console.error(e);
          alert("Update failed");
        }
      };

      container.appendChild(div);
    });

  }, (error) => {
    console.error("Firestore error:", error);
    container.innerHTML = "Error loading KYC data.";
  });
}