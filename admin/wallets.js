import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// Firebase config
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

const walletsTableBody = document.getElementById("walletsTableBody");
const searchInput = document.getElementById("searchInput");

// Admin auth
onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied. Admin only.");
    window.location.href = "admin-login.html";
    return;
  }
  loadWallets();
});

// Load all users and their coins
async function loadWallets() {
  const usersSnap = await getDocs(collection(db, "users"));
  walletsTableBody.innerHTML = "";

  usersSnap.forEach(docSnap => {
    const userData = docSnap.data();
    const uid = docSnap.id;

    const tr = document.createElement("tr");
    tr.className = "border-b border-zinc-700";

    // Coins table inside cell
    let coinsHtml = "";
    const allCoins = userData.coins || {};
    if (Object.keys(allCoins).length === 0) {
      coinsHtml = "<span class='text-zinc-400'>No coins</span>";
    } else {
      for (const [coin, amount] of Object.entries(allCoins)) {
        coinsHtml += `
          <div class="flex items-center mb-1">
            <span class="mr-2 font-bold">${coin}:</span>
            <input type="number" value="${amount}" class="crypto-input bg-zinc-900 text-white p-1 rounded w-20" data-coin="${coin}">
          </div>
        `;
      }
    }

    tr.innerHTML = `
      <td class="p-2">${uid}</td>
      <td class="p-2">${userData.name || ''}</td>
      <td class="p-2">${coinsHtml}</td>
      <td class="p-2"><button class="update-btn bg-emerald-400 text-black font-bold p-1 rounded">Update</button></td>
    `;

    // Update coins
    tr.querySelector(".update-btn").addEventListener("click", async () => {
      try {
        const updatedCoins = {};
        tr.querySelectorAll(".crypto-input").forEach(input => {
          updatedCoins[input.dataset.coin] = parseFloat(input.value);
        });

        await updateDoc(doc(db, "users", uid), { coins: updatedCoins });
        alert("Coins updated successfully!");
      } catch (err) {
        console.error(err);
        alert("Failed to update coins.");
      }
    });

    walletsTableBody.appendChild(tr);
  });
}

// Search filter
searchInput.addEventListener("input", () => {
  const filter = searchInput.value.toLowerCase();
  Array.from(walletsTableBody.children).forEach(tr => {
    const uid = tr.children[0].innerText.toLowerCase();
    const name = tr.children[1].innerText.toLowerCase();
    tr.style.display = uid.includes(filter) || name.includes(filter) ? "" : "none";
  });
});