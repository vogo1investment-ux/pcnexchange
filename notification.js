import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCQVHBn504Y26YtR38JRJhRlUbBoa2CIPo",
  authDomain: "pcnexchange.firebaseapp.com",
  databaseURL: "https://pcnexchange-default-rtdb.firebaseio.com",
  projectId: "pcnexchange",
  storageBucket: "pcnexchange.firebasestorage.app",
  messagingSenderId: "278761036604",
  appId: "1:278761036604:web:a02e2d2ac7a9379d6f9c39"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const notificationsList = document.getElementById("notificationsList");

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const uid = user.uid;
  const notifRef = collection(db, "notifications");

  // Listen for broadcast messages
  const broadcastQuery = query(notifRef, where("type", "==", "broadcast"));
  // Listen for personal messages
  const personalQuery = query(notifRef, where("type", "==", "personal"), where("userId", "==", uid));

  onSnapshot(broadcastQuery, broadcastSnap => {
    onSnapshot(personalQuery, personalSnap => {
      const allNotifs = [];
      broadcastSnap.forEach(doc => allNotifs.push(doc.data()));
      personalSnap.forEach(doc => allNotifs.push(doc.data()));

      if (allNotifs.length === 0) {
        notificationsList.innerHTML = "<p>No notifications</p>";
        return;
      }

      // Sort by newest
      allNotifs.sort((a, b) => {
        return (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0);
      });

      notificationsList.innerHTML = "";
      allNotifs.forEach(notif => {
        const div = document.createElement("div");
        div.className = "notification-card";
        div.innerText = notif.message || "No message";
        notificationsList.appendChild(div);
      });
    });
  });
});