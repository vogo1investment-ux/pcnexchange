import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Only your admin UID can send notifications
const ADMIN_UID = "XphWRwjVK6NWEtHw9XeoNxXsfT12";

onAuthStateChanged(auth, user => {
  if (!user || user.uid !== ADMIN_UID) {
    alert("Access Denied: Admin Only");
    window.location.href = "admin-login.html";
  }
});

// Handle Send Notification button
document.getElementById("sendBtn").addEventListener("click", async () => {
  const title = document.getElementById("titleInput").value.trim();
  const message = document.getElementById("messageInput").value.trim();
  const userId = document.getElementById("userIdInput").value.trim() || "all";
  const imageFile = document.getElementById("imageInput").files[0];

  if (!title || !message) {
    alert("Please enter both title and message.");
    return;
  }

  try {
    let imageUrl = "";
    if (imageFile) {
      const storageRef = ref(storage, `notifications/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    await addDoc(collection(db, "notifications"), {
      title,
      message,
      userId,
      imageUrl,
      createdAt: serverTimestamp()
    });

    alert("Notification sent successfully!");
    document.getElementById("titleInput").value = "";
    document.getElementById("messageInput").value = "";
    document.getElementById("userIdInput").value = "";
    document.getElementById("imageInput").value = "";
  } catch (err) {
    console.error(err);
    alert("Failed to send notification. Check network and Storage rules.");
  }
});
