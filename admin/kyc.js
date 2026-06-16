import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// 🔥 YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  databaseURL: "https://pcnexchange-default-rtdb.firebaseio.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const container = document.getElementById("kycList");

// 🔄 LOAD KYC REQUESTS
async function loadKYC() {
  container.innerHTML = "Loading...";

  const snap = await getDocs(collection(db, "kyc"));

  if (snap.empty) {
    container.innerHTML = "No KYC submissions found.";
    return;
  }

  container.innerHTML = "";

  snap.forEach((docSnap) => {
    const data = docSnap.data();

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="row">
        <div>
          <div class="label">Full Name</div>
          <div class="value">${data.name || "N/A"}</div>
        </div>

        <div>
          <div class="label">Phone</div>
          <div class="value">${data.phone || "N/A"}</div>
        </div>

        <div>
          <div class="label">Email</div>
          <div class="value">${data.email || "N/A"}</div>
        </div>

        <div>
          <div class="label">UID</div>
          <div class="value">${data.uid || docSnap.id}</div>
        </div>
      </div>

      <div class="status">Status: ${data.status || "pending"}</div>

      <select id="status-${docSnap.id}">
        <option value="pending">Pending</option>
        <option value="approved">Approve</option>
        <option value="rejected">Reject</option>
      </select>

      <button class="approve" onclick="updateStatus('${docSnap.id}')">
        Save Decision
      </button>
    `;

    container.appendChild(card);
  });
}

// 💾 UPDATE STATUS
window.updateStatus = async (id) => {
  const select = document.getElementById(`status-${id}`);
  const value = select.value;

  await updateDoc(doc(db, "kyc", id), {
    status: value
  });

  alert("KYC updated successfully!");
  loadKYC();
};

loadKYC();