import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, query, where, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  databaseURL: "https://pcnexchange-default-rtdb.firebaseio.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const notifContainer = document.getElementById("notifications");

// Query notifications where userId = "all" (admin broadcast)
const notifRef = collection(db, "notifications");
const q = query(notifRef, where("userId", "==", "all"), orderBy("createdAt", "desc"));

// Listen for real-time updates
onSnapshot(q, (snapshot) => {
  notifContainer.innerHTML = "";
  if (snapshot.empty) {
    notifContainer.innerHTML = "<p>No notifications yet.</p>";
    return;
  }

  snapshot.forEach((doc) => {
    const data = doc.data();
    const div = document.createElement("div");
    div.className = "notification-card";
    div.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.message}</p>
      ${data.imageUrl ? `<img src="${data.imageUrl}" alt="notification image">` : ''}
      <small>${data.createdAt?.toDate?.() || ''}</small>
    `;
    notifContainer.appendChild(div);
  });
});