import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, browserLocalPersistence, setPersistence } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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
const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

// Redirect if already logged in
onAuthStateChanged(auth, user => {
  if (user && user.uid === ADMIN_UID) {
    window.location.href = "admin-dashboard-full.html";
  }
});

document.getElementById("loginBtn").onclick = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if(!email || !password){ alert("Enter email and password"); return; }

  try{
    await setPersistence(auth, browserLocalPersistence);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if(userCredential.user.uid !== ADMIN_UID){
      alert("Access denied: Not an admin");
      return;
    }
    window.location.href = "admin-dashboard-full.html";
  }catch(e){
    alert("Login failed: " + e.message);
    console.error(e);
  }
};