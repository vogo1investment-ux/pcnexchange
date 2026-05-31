import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  databaseURL: "https://pcnexchange-default-rtdb.firebaseio.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Persistent login
setPersistence(auth, browserLocalPersistence);

const emailInput = document.getElementById("userEmail");
const uidInput = document.getElementById("userUid");
const copyBtn = document.getElementById("copyBtn");
const qrCanvas = document.getElementById("qrcode");

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const userEmail = user.email || "No Email";
  const userUid = user.uid;

  emailInput.value = userEmail;
  uidInput.value = userUid;

  // Generate QR code containing both email + uid
  const qr = new QRious({
    element: qrCanvas,
    value: JSON.stringify({ email: userEmail, uid: userUid }),
    size: 200,
    background: "#000",
    foreground: "#0f0"
  });
});

// Copy to clipboard
copyBtn.addEventListener("click", () => {
  const text = `Email: ${emailInput.value}\nUID: ${uidInput.value}`;
  navigator.clipboard.writeText(text).then(() => {
    alert("Wallet info copied to clipboard!");
  }).catch(() => {
    alert("Failed to copy.");
  });
});