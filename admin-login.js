import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, 
  setPersistence, browserLocalPersistence, browserSessionPersistence 
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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

// Real Admin UID
const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

// Redirect if already logged in
onAuthStateChanged(auth, (user) => {
  if (user && user.uid === ADMIN_UID) {
    window.location.href = "admin-dashboard.html";
  }
});

// Login button
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const rememberMe = document.getElementById("rememberMe").checked;

  if (!email || !password) {
    alert("Please enter both email and password");
    return;
  }

  try {
    await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

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