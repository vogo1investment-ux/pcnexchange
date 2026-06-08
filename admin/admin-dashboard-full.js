import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-storage.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// Firebase config (your existing one)
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

const sectionContent = document.getElementById("section-content");

function loadNotifyUsersPanel() {
  sectionContent.innerHTML = `
    <div class="notify-panel">
      <h2 class="text-emerald-400 font-bold mb-4">Send Notification</h2>
      <input type="text" id="notifyTitle" placeholder="Notification Title">
      <textarea id="notifyMessage" placeholder="Message" rows="4"></textarea>
      <input type="text" id="notifyUserId" placeholder="User ID (leave empty for all)">
      <input type="file" id="notifyImage">
      <button id="notifySendBtn">Send Notification</button>
    </div>
  `;

  document.getElementById("notifySendBtn").addEventListener("click", async () => {
    const title = document.getElementById("notifyTitle").value.trim();
    const message = document.getElementById("notifyMessage").value.trim();
    const userIdInput = document.getElementById("notifyUserId").value.trim();
    const imageFile = document.getElementById("notifyImage").files[0];
    const userId = userIdInput || "all";

    if (!title || !message) return alert("Title and message are required.");

    try {
      let imageUrl = "";
      if (imageFile) {
        const storageRef = ref(storage, `notifications/${Date.now()}_${imageFile.name}`);
        const snap = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snap.ref);
      }

      await addDoc(collection(db, "notifications"), {
        userId,
        title,
        message,
        imageUrl,
        createdAt: serverTimestamp()
      });

      alert("Notification sent!");
      document.getElementById("notifyTitle").value = "";
      document.getElementById("notifyMessage").value = "";
      document.getElementById("notifyUserId").value = "";
      document.getElementById("notifyImage").value = "";
    } catch (err) {
      console.error(err);
      alert("Failed to send notification. Check your rules and network.");
    }
  });
}

// Attach admin buttons
document.querySelectorAll(".admin-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const section = btn.dataset.section;

    if (section === "notify-users") {
      loadNotifyUsersPanel();
      return;
    }

    // Your existing section loading logic for other buttons
    // ...
  });
});
