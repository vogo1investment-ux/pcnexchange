import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

const usersTableBody = document.getElementById("usersTableBody");
const searchInput = document.getElementById("searchInput");

onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied. Admin only.");
    window.location.href = "admin-login.html";
  } else {
    loadUsers();
  }
});

async function loadUsers() {
  usersTableBody.innerHTML = "<tr><td colspan='4' class='p-2'>Loading...</td></tr>";

  const usersSnap = await getDocs(collection(db, "users"));
  usersTableBody.innerHTML = "";

  for (let userDoc of usersSnap.docs) {
    const userData = userDoc.data();
    const uid = userDoc.id;
    const name = userData.name || "-";

    // Fetch coins subcollection
    const coinsSnap = await getDocs(collection(db, `users/${uid}/coins`));
    let coinsHtml = "";
    coinsSnap.forEach(coinDoc => {
      const c = coinDoc.data();
      coinsHtml += `
        <div class="flex gap-2 items-center mb-1">
          <span class="font-bold">${c.coin}</span>
          <input type="number" step="0.0001" value="${c.amount}" data-user="${uid}" data-coin="${c.coin}"
          class="w-24 p-1 rounded bg-zinc-800 text-white balanceInput">
        </div>`;
    });

    if (!coinsHtml) coinsHtml = "<span>No coins</span>";

    usersTableBody.innerHTML += `
      <tr class="border-b border-zinc-700">
        <td class="border p-2">${uid}</td>
        <td class="border p-2">${name}</td>
        <td class="border p-2">${coinsHtml}</td>
        <td class="border p-2">
          <button class="updateBtn bg-emerald-400 text-black px-2 py-1 rounded font-bold">Update</button>
        </td>
      </tr>`;
  }

  attachUpdateEvents();
}

// Attach update button events
function attachUpdateEvents() {
  document.querySelectorAll(".updateBtn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const row = e.target.closest("tr");
      const uid = row.children[0].textContent;
      const inputs = row.querySelectorAll(".balanceInput");

      for (let input of inputs) {
        const coin = input.dataset.coin;
        const amount = parseFloat(input.value) || 0;

        const coinRef = doc(db, `users/${uid}/coins/${coin}`);
        await updateDoc(coinRef, { amount });
      }

      alert("Balances updated!");
    });
  });
}

// Search functionality
searchInput.addEventListener("input", () => {
  const filter = searchInput.value.toLowerCase();
  document.querySelectorAll("#usersTableBody tr").forEach(tr => {
    const uid = tr.children[0].textContent.toLowerCase();
    const name = tr.children[1].textContent.toLowerCase();
    tr.style.display = uid.includes(filter) || name.includes(filter) ? "" : "none";
  });
});