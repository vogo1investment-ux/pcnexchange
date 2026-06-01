import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

const db = getFirestore();
const marketContainer = document.getElementById("marketCoins");
const coinsCol = collection(db, "coins");

async function loadAllCoins() {
  marketContainer.innerHTML = "";
  const snapshot = await getDocs(coinsCol);
  if(snapshot.empty) {
    marketContainer.innerHTML = "<p style='color:#f00;'>No coins found.</p>";
    return;
  }

  snapshot.forEach(doc => {
    const coin = doc.data();
    const card = document.createElement("div");
    card.className = "coin-card";
    card.innerHTML = `
      <div class="coin-name">${coin.name} (${coin.symbol})</div>
      <div class="coin-description">${coin.description}</div>
      <div class="coin-price" style="color:#0f0">$${coin.price}</div>
    `;
    card.addEventListener("click", () => {
      window.location.href = `coin.html?symbol=${coin.symbol}`;
    });
    marketContainer.appendChild(card);
  });
}

loadAllCoins();