import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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

const coinSelect = document.getElementById("coinSelect");
const coinBalanceEl = document.getElementById("coinBalance");
const tradeAmountInput = document.getElementById("tradeAmount");
const tradeDuration = document.getElementById("tradeDuration");
const buyBtn = document.getElementById("buyBtn");
const sellBtn = document.getElementById("sellBtn");
const tradeHistoryEl = document.getElementById("tradeHistory");

let userCoins = {};
let coinDocs = {};
let snapshotCoins;

onAuthStateChanged(auth, async user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const uid = user.uid;
  const coinsRef = collection(db, "users", uid, "coins");

  // Load coins
  onSnapshot(coinsRef, snapshot => {
    snapshotCoins = snapshot;
    coinSelect.innerHTML = "";
    userCoins = {};
    coinDocs = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const coinName = data.name || data.coinName || "Unnamed Coin";
      userCoins[coinName] = parseFloat(data.balance || 0);
      coinDocs[coinName] = doc.ref;
      const option = document.createElement("option");
      option.value = coinName;
      option.textContent = `${coinName} (${data.symbol || ""}) - ${userCoins[coinName].toFixed(8)}`;
      coinSelect.appendChild(option);
    });
    updateBalance();
  });

  coinSelect.addEventListener("change", updateBalance);

  function updateBalance() {
    const selected = coinSelect.value;
    coinBalanceEl.textContent = userCoins[selected]?.toFixed(8) || "0.00000000";
    tradeAmountInput.value = "0.00000000";
  }

  async function createTrade(type) {
    const selected = coinSelect.value;
    const amount = parseFloat(tradeAmountInput.value);
    if (!selected || amount <= 0) return alert("Enter a valid amount");
    if (amount > userCoins[selected]) return alert("Insufficient balance");

    const coinDoc = coinDocs[selected];
    if (!coinDoc) return alert("Coin not found");

    // Deduct balance
    const newBalance = userCoins[selected] - amount;
    await coinDoc.update({ balance: newBalance });

    // Add pending trade
    await addDoc(collection(db, "pendingTrades"), {
      userId: uid,
      coin: selected,
      amount,
      type,
      duration: tradeDuration.value,
      status: "pending",
      createdAt: serverTimestamp(),
      profit: 0
    });

    alert(`Trade ${type.toUpperCase()} submitted! Pending approval.`);
  }

  buyBtn.addEventListener("click", () => createTrade("buy"));
  sellBtn.addEventListener("click", () => createTrade("sell"));

  // Trade history
  const tradesRef = collection(db, "pendingTrades");
  const tradeQuery = query(tradesRef, where("userId", "==", uid));
  onSnapshot(tradeQuery, snapshot => {
    tradeHistoryEl.innerHTML = "";
    if (snapshot.empty) tradeHistoryEl.innerHTML = "<p>No trades yet</p>";
    snapshot.forEach(doc => {
      const t = doc.data();
      const div = document.createElement("div");
      div.className = `trade-card ${t.status}`;
      div.textContent = `${t.type.toUpperCase()} ${t.amount} ${t.coin} - ${t.status.toUpperCase()} ${t.profit ? `Profit: ${t.profit}` : ""}`;
      tradeHistoryEl.appendChild(div);
    });
  });

  // Candlestick chart
  const ctx = document.getElementById("tradeChart").getContext("2d");
  const chart = new Chart(ctx, {
    type: 'candlestick',
    data: {
      datasets: [{
        label: 'Candles',
        data: Array.from({length: 20}, () => generateRandomCandle())
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });

  function generateRandomCandle() {
    const open = Math.random() * 100;
    const close = open + (Math.random() * 10 - 5);
    const high = Math.max(open, close) + Math.random() * 5;
    const low = Math.min(open, close) - Math.random() * 5;
    return { x: new Date(), o: open, h: high, l: low, c: close };
  }

  setInterval(() => {
    chart.data.datasets[0].data.push(generateRandomCandle());
    chart.data.datasets[0].data.shift();
    chart.update();
  }, 2000);

});