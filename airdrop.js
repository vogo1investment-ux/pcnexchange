import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const listEl = document.getElementById("list");

let ready = false;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    listEl.innerHTML = "❌ Login required";
    return;
  }

  ready = true;
  listEl.innerHTML = "✅ Logged in";
});

window.loadAirdrops = async function () {

  if (!ready) {
    listEl.innerHTML = "⏳ Waiting for login...";
    return;
  }

  try {
    listEl.innerHTML = "Loading airdrops...";

    const snap = await getDocs(collection(db, "airdropCampaigns"));

    if (snap.empty) {
      listEl.innerHTML = "❌ No airdrops found in Firestore";
      return;
    }

    listEl.innerHTML = "";

    snap.forEach(doc => {
      const d = doc.data();

      const div = document.createElement("div");
      div.style.padding = "10px";
      div.style.margin = "10px";
      div.style.background = "#111";
      div.style.color = "white";

      div.innerHTML = `
        <h3>🚀 ${d.name || "Airdrop"}</h3>
        <p>⚡ Rate: ${d.rate}</p>
        <p>📅 Status: ${d.status}</p>
        <button onclick="alert('Mining not started yet')">Start Mining</button>
      `;

      listEl.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    listEl.innerHTML = "❌ Firestore read failed (check login + rules)";
  }
};