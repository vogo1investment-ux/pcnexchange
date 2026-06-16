import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// 🔥 YOUR FIREBASE CONFIG
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

// 🔐 ADMIN UID
const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

// DOM
const kycContainer = document.getElementById("kycContainer");

// CHECK ADMIN LOGIN
onAuthStateChanged(auth, (user) => {
  if (!user) {
    kycContainer.innerHTML = "Please login as admin";
    return;
  }

  if (user.uid !== ADMIN_UID) {
    kycContainer.innerHTML = "Access denied (Not admin)";
    return;
  }

  loadKYC();
});

// LOAD KYC REALTIME
function loadKYC() {
  const q = query(collection(db, "kyc"), orderBy("status"));

  onSnapshot(q, (snapshot) => {
    kycContainer.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      const card = document.createElement("div");
      card.className = "kyc-card";

      card.innerHTML = `
        <h3>👤 ${data.fullName || "No Name"}</h3>

        <p>📧 Email: ${data.email || "-"}</p>
        <p>📱 Phone: ${data.phone || "-"}</p>
        <p>🆔 UID: ${data.uid || "-"}</p>
        <p>🔢 ID Number: ${data.idNumber || "-"}</p>

        <img src="${data.idImage || ''}" class="kyc-img"/>

        <p>Status: <b>${data.status || "pending"}</b></p>

        <select class="statusSelect">
          <option value="pending">Pending</option>
          <option value="approved">Approve</option>
          <option value="rejected">Reject</option>
        </select>

        <button class="saveBtn">Update Status</button>
      `;

      const select = card.querySelector(".statusSelect");
      const btn = card.querySelector(".saveBtn");

      select.value = data.status || "pending";

      btn.onclick = async () => {
        await updateDoc(doc(db, "kyc", docSnap.id), {
          status: select.value
        });

        alert("KYC updated!");
      };

      kycContainer.appendChild(card);
    });
  });
}