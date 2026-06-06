import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-storage.js";

// Firebase config
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

document.addEventListener("DOMContentLoaded", () => {
  const sendBtn = document.getElementById("sendBtn");
  const userIdInput = document.getElementById("userIdInput");
  const titleInput = document.getElementById("titleInput");
  const messageInput = document.getElementById("messageInput");
  const imageInput = document.getElementById("imageInput");

  // Ensure admin access
  onAuthStateChanged(auth, user => {
    if (!user || user.uid !== "XphWRwjVK6NWEtHw9XeoNxXsfT12") {
      alert("Access Denied: Admin Only");
      window.location.href = "admin-login.html";
      return;
    }

    // Attach event only once
    sendBtn.addEventListener("click", async () => {
      const userId = userIdInput.value.trim() || "all";
      const title = titleInput.value.trim();
      const message = messageInput.value.trim();
      const imageFile = imageInput.files[0];

      if (!title || !message) return alert("Title and message are required");

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
        userIdInput.value = "";
        titleInput.value = "";
        messageInput.value = "";
        imageInput.value = "";
      } catch (err) {
        console.error("Error sending notification:", err);
        alert("Failed to send notification. Check console.");
      }
    });
  });
});