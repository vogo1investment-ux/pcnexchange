import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  databaseURL: "https://pcnexchange-default-rtdb.firebaseio.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.appspot.com",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const logDiv = document.getElementById("log");

function logMessage(msg, success=true){
  const div = document.createElement("div");
  div.textContent = msg;
  div.className = success ? "log-success" : "log-error";
  logDiv.prepend(div);
}

async function sendNotification(){
  const user = auth.currentUser;
  if(!user){
    logMessage("You must be logged in as admin!", false);
    return;
  }
  if(user.uid !== ADMIN_UID){
    logMessage("You are not authorized!", false);
    return;
  }

  const userId = document.getElementById("userId").value.trim() || "all";
  const title = document.getElementById("title").value.trim();
  const message = document.getElementById("message").value.trim();

  if(!title || !message){
    logMessage("Title and message cannot be empty!", false);
    return;
  }

  try {
    await addDoc(collection(db, "notifications"), {
      userId,
      title,
      message,
      createdAt: serverTimestamp()
    });
    logMessage(`Notification sent to '${userId}' ✅`);
    document.getElementById("userId").value = "";
    document.getElementById("title").value = "";
    document.getElementById("message").value = "";
  } catch(err){
    logMessage("Failed to send notification: " + err.message, false);
  }
}

document.getElementById("sendBtn").addEventListener("click", sendNotification);