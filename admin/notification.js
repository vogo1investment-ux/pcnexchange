// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  databaseURL: "https://pcnexchange-default-rtdb.firebaseio.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.appspot.com",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// UI elements
const userIdInput = document.getElementById("userId");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");
const statusEl = document.getElementById("status");

// Send notification function
sendBtn.addEventListener("click", async () => {
  const message = messageInput.value.trim();
  const userId = userIdInput.value.trim() || "all";

  if (!message) {
    statusEl.textContent = "⚠️ Please enter a message before sending!";
    statusEl.style.color = "red";
    return;
  }

  sendBtn.disabled = true;
  statusEl.textContent = "Sending...";
  statusEl.style.color = "#0f0";

  try {
    await db.collection("notifications").add({
      message: message,
      userId: userId,
      createdAt: Date.now()
    });

    statusEl.textContent = "✅ Notification sent!";
    messageInput.value = "";
    userIdInput.value = "";
  } catch (error) {
    console.error("Error sending notification:", error);
    statusEl.textContent = "❌ Failed to send notification!";
    statusEl.style.color = "red";
  } finally {
    sendBtn.disabled = false;
  }
});