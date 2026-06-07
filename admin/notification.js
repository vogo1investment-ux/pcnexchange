import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  databaseURL: "https://pcnexchange-default-rtdb.firebaseio.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.appspot.com",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const sendBtn = document.getElementById("sendBtn");
const userIdInput = document.getElementById("userId");
const messageInput = document.getElementById("message");
const statusDiv = document.getElementById("status");

sendBtn.addEventListener("click", async () => {
  const message = messageInput.value.trim();
  const userId = userIdInput.value.trim() || "all";

  if (!message) {
    statusDiv.textContent = "Please enter a message!";
    statusDiv.style.color = "red";
    return;
  }

  const currentUser = auth.currentUser;
  if (!currentUser) {
    statusDiv.textContent = "You must be logged in as admin!";
    statusDiv.style.color = "red";
    return;
  }

  // Ensure this is the correct admin UID
  if (currentUser.uid !== "XphWRwjVK6NWEtHw9XeoNxXsfT12") {
    statusDiv.textContent = "You are not authorized to send notifications.";
    statusDiv.style.color = "red";
    return;
  }

  try {
    await addDoc(collection(db, "notifications"), {
      message,
      userId,
      createdAt: serverTimestamp()
    });

    statusDiv.textContent = `Notification sent to ${userId === "all" ? "everyone" : userId}!`;
    statusDiv.style.color = "#0f0";
    messageInput.value = "";
    userIdInput.value = "";

  } catch (error) {
    console.error("Error sending notification:", error);
    statusDiv.textContent = "Failed to send notification.";
    statusDiv.style.color = "red";
  }
});