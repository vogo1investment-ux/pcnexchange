import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-storage.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";

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

const sendBtn = document.getElementById("sendBtn");
const titleInput = document.getElementById("titleInput");
const messageInput = document.getElementById("messageInput");
const userIdInput = document.getElementById("userIdInput");
const imageInput = document.getElementById("imageInput");
const statusDiv = document.getElementById("notificationStatus");

onAuthStateChanged(auth, user => {
  if(!user) {
    statusDiv.innerText = "You must be logged in as admin.";
  }
});

sendBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const message = messageInput.value.trim();
  const userId = userIdInput.value.trim() || "all";
  const imageFile = imageInput.files[0];

  if(!title || !message){
    statusDiv.innerText = "Title and message required.";
    return;
  }

  try{
    let imageUrl = "";
    if(imageFile){
      const storageRef = ref(storage, `notifications/${Date.now()}_${imageFile.name}`);
      const snap = await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(snap.ref);
    }

    await addDoc(collection(db, "notifications"), {
      title,
      message,
      userId,
      imageUrl,
      createdAt: serverTimestamp()
    });

    statusDiv.innerText = "Notification sent!";
    titleInput.value = "";
    messageInput.value = "";
    userIdInput.value = "";
    imageInput.value = "";
  }catch(err){
    console.error(err);
    statusDiv.innerText = "Failed to send notification.";
  }
});