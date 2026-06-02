// admin-login.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Remember Me Checkbox
let rememberMe = true; // Default true; admin stays logged in

// Apply persistence
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistence set to local (Remember Me active)");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

// Check if admin is already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "admin-dashboard.html";
  }
});

// Login button event
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Please enter both email and password");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Optional: restrict access to your admin UID
    const ADMIN_UID = "YOUR_ADMIN_UID"; // Replace with your actual admin UID
    if (user.uid !== ADMIN_UID) {
      alert("Access denied: Not an admin");
      await auth.signOut();
      return;
    }

    alert("Login successful!");
    window.location.href = "admin-dashboard.html";

  } catch (error) {
    console.error(error);
    alert("Login failed: " + error.message);
  }
});