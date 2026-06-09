import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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
const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

const usersTableBody = document.getElementById("usersTableBody");
const searchInput = document.getElementById("searchInput");

// Admin auth
onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied. Admin only.");
    window.location.href = "admin-login.html";
    return;
  }
  loadUsers();
});

// Load all users
async function loadUsers() {
  const usersSnap = await getDocs(collection(db, "users"));
  usersTableBody.innerHTML = "";

  usersSnap.forEach(docSnap => {
    const u = docSnap.data();
    const uid = docSnap.id;

    const tr = document.createElement("tr");
    tr.className = "border-b border-zinc-700";

    // Crypto assets inputs
    const cryptoAssetsInputs = Object.entries(u.coins || {})
      .map(([coin, amount]) => `<label>${coin}: <input type="number" value="${amount}" class="crypto-input bg-zinc-900 text-white p-1 rounded w-20 mr-2" data-coin="${coin}"></label>`)
      .join("");

    tr.innerHTML = `
      <td class="p-2">${uid}</td>
      <td class="p-2"><input type="text" value="${u.name || ''}" class="bg-zinc-900 text-white p-1 rounded w-full"></td>
      <td class="p-2"><input type="number" value="${u.availableBalance || 0}" class="bg-zinc-900 text-white p-1 rounded w-full"></td>
      <td class="p-2"><input type="number" value="${u.withdrawableBalance || 0}" class="bg-zinc-900 text-white p-1 rounded w-full"></td>
      <td class="p-2"><input type="number" value="${u.referralCommission || 0}" class="bg-zinc-900 text-white p-1 rounded w-full"></td>
      <td class="p-2">${cryptoAssetsInputs}</td>
      <td class="p-2"><button class="update-btn bg-emerald-400 text-black font-bold p-1 rounded">Update</button></td>
    `;

    // Update handler
    tr.querySelector(".update-btn").addEventListener("click", async () => {
      try {
        // Gather updated coin balances
        const coins = {};
        tr.querySelectorAll(".crypto-input").forEach(input => {
          coins[input.dataset.coin] = parseFloat(input.value);
        });

        await updateDoc(doc(db, "users", uid), {
          name: tr.children[1].querySelector("input").value,
          availableBalance: parseFloat(tr.children[2].querySelector("input").value),
          withdrawableBalance: parseFloat(tr.children[3].querySelector("input").value),
          referralCommission: parseFloat(tr.children[4].querySelector("input").value),
          coins
        });
        alert("User updated successfully!");
      } catch (err) {
        console.error(err);
        alert("Failed to update user.");
      }
    });

    usersTableBody.appendChild(tr);
  });
}

// Search/filter users
searchInput.addEventListener("input", () => {
  const filter = searchInput.value.toLowerCase();
  Array.from(usersTableBody.children).forEach(tr => {
    const uid = tr.children[0].innerText.toLowerCase();
    const name = tr.children[1].querySelector("input").value.toLowerCase();
    tr.style.display = uid.includes(filter) || name.includes(filter) ? "" : "none";
  });
});