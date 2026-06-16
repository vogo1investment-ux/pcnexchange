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

const container = document.getElementById("users");

onAuthStateChanged(auth, (user) => {

  if (!user) {
    container.innerHTML = "Login required";
    return;
  }

  if (user.uid !== ADMIN_UID) {
    container.innerHTML = "Access denied";
    return;
  }

  loadUsers();
});

function loadUsers() {

  const ref = collection(db, "users");

  onSnapshot(ref, (snap) => {

    container.innerHTML = "";

    snap.forEach((docSnap) => {

      const u = docSnap.data();

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <div class="name">${u.username || "No Username"}</div>

        <div class="small">UID: ${u.uid || docSnap.id}</div>

        <div class="grid">

          <div>
            <label>Available Balance</label>
            <input class="available" value="${u.availableBalance || 0}">
          </div>

          <div>
            <label>Withdrawal Balance</label>
            <input class="withdrawal" value="${u.withdrawalBalance || 0}">
          </div>

          <div>
            <label>Referral Commission</label>
            <input class="refCom" value="${u.referralCommission || 0}">
          </div>

          <div>
            <label>Referrals Count</label>
            <input class="refCount" value="${u.referrals || 0}">
          </div>

        </div>

        <button>UPDATE USER</button>
      `;

      const btn = card.querySelector("button");

      btn.onclick = async () => {

        const available = card.querySelector(".available").value;
        const withdrawal = card.querySelector(".withdrawal").value;
        const refCom = card.querySelector(".refCom").value;
        const refCount = card.querySelector(".refCount").value;

        await updateDoc(doc(db, "users", docSnap.id), {
          availableBalance: Number(available),
          withdrawalBalance: Number(withdrawal),
          referralCommission: Number(refCom),
          referrals: Number(refCount)
        });

        alert("User updated successfully");
      };

      container.appendChild(card);
    });

  });
}