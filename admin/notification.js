// Import Firebase functions (already included in HTML via <script> tags)
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// Initialize Firestore
const db = getFirestore();

// UI elements
const userIdInput = document.getElementById("userId");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");
const statusEl = document.getElementById("status");

// Send notification
sendBtn.addEventListener("click", async () => {
  const message = messageInput.value.trim();
  const userId = userIdInput.value.trim() || "all"; // default broadcast

  if (!message) {
    statusEl.textContent = "⚠️ Please enter a message before sending!";
    statusEl.style.color = "red";
    return;
  }

  sendBtn.disabled = true;
  statusEl.textContent = "Sending...";
  statusEl.style.color = "#0f0";

  try {
    await addDoc(collection(db, "notifications"), {
      message: message,
      userId: userId,
      createdAt: serverTimestamp()
    });

    statusEl.textContent = "✅ Notification sent!";
    statusEl.style.color = "#0f0";
    messageInput.value = "";
    userIdInput.value = "";
  } catch (err) {
    console.error("Error sending notification:", err);
    statusEl.textContent = "❌ Failed to send notification! Make sure you are logged in as the admin UID.";
    statusEl.style.color = "red";
  } finally {
    sendBtn.disabled = false;
  }
});