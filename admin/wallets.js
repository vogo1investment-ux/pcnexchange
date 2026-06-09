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

const walletsTableBody = document.getElementById("walletsTableBody");
const searchInput = document.getElementById("searchInput");

// Admin check
onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied: Admin only");
    window.location.href = "admin-login.html";
    return;
  }
  loadWallets();
});

// Load all user wallets
async function loadWallets() {
  walletsTableBody.innerHTML = "<tr><td colspan='5' class='p-2 text-center'>Loading...</td></tr>";
  const usersSnap = await getDocs(collection(db, "users"));

  walletsTableBody.innerHTML = "";

  for (const userDoc of usersSnap.docs) {
    const userData = userDoc.data();
    const uid = userDoc.id;
    const name = userData.name || "No Name";

    if (!userData.coins) continue; // skip if user has no coins

    for (const [coin, amount] of Object.entries(userData.coins)) {
      const row = document.createElement("tr");
      row.className = "border-b border-zinc-700";

      row.innerHTML = `
        <td class="p-2">${uid}</td>
        <td class="p-2">${name}</td>
        <td class="p-2">${coin}</td>
        <td class="p-2">
          <input type="number" value="${amount}" class="w-full bg-zinc-800 p-1 rounded text-white" step="0.00000001">
        </td>
        <td class="p-2">
          <button class="bg-emerald-500 p-1 rounded text-black font-bold">Update</button>
        </td>
      `;

      const input = row.querySelector("input");
      const btn = row.querySelector("button");

      btn.addEventListener("click", async () => {
        const newAmount = parseFloat(input.value);
        if (isNaN(newAmount)) {
          alert("Invalid amount");
          return;
        }

        try {
          await updateDoc(doc(db, "users", uid), {
            [`coins.${coin}`]: newAmount
          });
          alert(`Updated ${coin} for ${name} to ${newAmount}`);
        } catch (err) {
          console.error(err);
          alert("Failed to update coin amount");
        }
      });

      walletsTableBody.appendChild(row);
    }
  }
}

// Search filter
searchInput.addEventListener("input", () => {
  const filter = searchInput.value.toLowerCase();
  walletsTableBody.querySelectorAll("tr").forEach(row => {
    const uid = row.children[0]?.innerText.toLowerCase();
    const name = row.children[1]?.innerText.toLowerCase();
    row.style.display = uid.includes(filter) || name.includes(filter) ? "" : "none";
  });
});