//notifications.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey:"AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain:"pcnexchange.firebaseapp.com",
  databaseURL:"https://pcnexchange-default-rtdb.firebaseio.com",
  projectId:"pcnexchange",
  storageBucket:"pcnexchange.appspot.com",
  messagingSenderId:"278761036604",
  appId:"1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Log helper function
function appendLog(msg, success = true) {
    const log = document.getElementById("log");
    if(!log) return;
    const div = document.createElement("div");
    div.textContent = msg;
    div.className = success ? "log-success" : "log-error";
    log.prepend(div);
}

// Admin login function
export async function adminLogin(email, password) {
    if(!email || !password){
        appendLog("Email and password required!", false);
        return false;
    }
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        if(user.uid !== ADMIN_UID){
            appendLog("Not the correct admin account!", false);
            return false;
        }
        appendLog("Admin logged in successfully ✅");
        return true;
    } catch(err) {
        appendLog("Login failed: " + err.message, false);
        return false;
    }
}

// Send notification function
export async function sendNotification() {
    const user = auth.currentUser;
    if(!user || user.uid !== ADMIN_UID){
        appendLog("You must log in as admin first!", false);
        return;
    }

    const userId = document.getElementById("userId").value.trim() || "all";
    const title = document.getElementById("title").value.trim();
    const message = document.getElementById("message").value.trim();

    if(!title || !message){
        appendLog("Title and message are required!", false);
        return;
    }

    try {
        await addDoc(collection(db,"notifications"), {
            title,
            message,
            userId,
            createdAt: serverTimestamp()
        });
        appendLog(`Notification sent to '${userId}' ✅`);
        document.getElementById("title").value = "";
        document.getElementById("message").value = "";
        document.getElementById("userId").value = "";
    } catch(err) {
        appendLog("Failed to send notification: " + err.message, false);
    }
}

// Attach events
export function setupAdminPanel() {
    const loginBtn = document.getElementById("loginBtn");
    const sendBtn = document.getElementById("sendBtn");

    if(loginBtn){
        loginBtn.addEventListener("click", async () => {
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            await adminLogin(email, password);
        });
    }

    if(sendBtn){
        sendBtn.addEventListener("click", async () => {
            await sendNotification();
        });
    }
}

// Call setup
setupAdminPanel();