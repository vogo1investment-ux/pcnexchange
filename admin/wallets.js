import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

const usersTableBody = document.getElementById("usersTableBody");

onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied. Admin only.");
    window.location.href = "admin-login.html";
  } else {
    loadUsers();
  }
});

async function loadUsers() {
  usersTableBody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";
  const usersSnap = await getDocs(collection(db, "users"));
  usersTableBody.innerHTML = "";

  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    const userData = userDoc.data();
    const name = userData.name || "-";

    // Query coins subcollection dynamically
    const coinsSnap = await getDocs(collection(db, `users/${uid}/coins`));
    let coinsHtml = "";
    if (!coinsSnap.empty) {
      coinsSnap.forEach(coinDoc => {
        const c = coinDoc.data();
        coinsHtml += `
          <div class="flex gap-2 mb-1">
            <span class="font-bold">${c.coin}</span>
            <input type="number" step="0.0001" value="${c.amount}" data-user="${uid}" data-coin="${c.coin}" class="balanceInput w-24 p-1 rounded bg-zinc-800 text-white">
          </div>
        `;
      });
    } else {
      coinsHtml = "No coins";
    }

    usersTableBody.innerHTML += `
      <tr class="border-b border-zinc-700">
        <td>${uid}</td>
        <td>${name}</td>
        <td>${coinsHtml}</td>
        <td><button class="updateBtn bg-emerald-400 text-black px-2 py-1 rounded">Update</button></td>
      </tr>`;
  }

  attachUpdateEvents();
}

function attachUpdateEvents() {
  document.querySelectorAll(".updateBtn").forEach(btn => {
    btn.addEventListener("click", async e => {
      const row = e.target.closest("tr");
      const inputs = row.querySelectorAll(".balanceInput");
      for (const input of inputs) {
        const uid = input.dataset.user;
        const coin = input.dataset.coin;
        const amount = parseFloat(input.value) || 0;
        await updateDoc(doc(db, `users/${uid}/coins/${coin}`), { amount });
      }
      alert("Balances updated!");
    });
  });
}