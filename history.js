import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  databaseURL: "https://pcnexchange-default-rtdb.firebaseio.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Function to create a card
function createCard(data, extraFieldLabel = null, extraFieldValue = null) {
  const card = document.createElement('div');
  card.className = 'card';

  const amountP = document.createElement('p');
  amountP.innerHTML = `<span class="field-label">Amount:</span> ${data.amount}`;
  card.appendChild(amountP);

  const datetimeP = document.createElement('p');
  datetimeP.innerHTML = `<span class="field-label">Date & Time:</span> ${data.datetime}`;
  card.appendChild(datetimeP);

  if (extraFieldLabel && extraFieldValue) {
    const extraP = document.createElement('p');
    extraP.innerHTML = `<span class="field-label">${extraFieldLabel}:</span> ${extraFieldValue}`;
    card.appendChild(extraP);
  }

  return card;
}

// Function to display history in cards
function displayHistory(containerId, data, extraField = null, extraLabel = '') {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  for (const key in data) {
    const card = createCard(data[key], extraField ? extraLabel : null, extraField ? data[key][extraField] : null);
    container.appendChild(card);
  }
}

// Load deposit history
onValue(ref(db, 'depositHistory'), (snapshot) => {
  const data = snapshot.val() || {};
  displayHistory('depositCards', data);
});

// Load withdrawal history
onValue(ref(db, 'withdrawalHistory'), (snapshot) => {
  const data = snapshot.val() || {};
  displayHistory('withdrawalCards', data);
});

// Load sent history
onValue(ref(db, 'sentHistory'), (snapshot) => {
  const data = snapshot.val() || {};
  displayHistory('sentCards', data, 'recipient', 'Recipient');
});

// Load received history
onValue(ref(db, 'receivedHistory'), (snapshot) => {
  const data = snapshot.val() || {};
  displayHistory('receivedCards', data, 'sender', 'Sender');
});