import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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
const auth = getAuth(app);

const notificationList = document.getElementById("notificationList");
const notificationCount = document.getElementById("notificationCount");

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const uid = user.uid;
  const notifRef = collection(db, "notifications");
  const q = query(notifRef, orderBy("createdAt", "desc"));

  onSnapshot(q, snapshot => {
    notificationList.innerHTML = "";
    let count = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.userId === uid || data.userId === "all") {
        count++;
        const div = document.createElement("div");
        div.className = "notification-card";
        div.innerHTML = `
          <h3>${data.title || "Notification"}</h3>
          <p>${data.message}</p>
          ${data.imageUrl ? `<img src="${data.imageUrl}" alt="Image">` : ""}
          <small>${data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : ""}</small>
        `;
        notificationList.appendChild(div);
      }
    });

    notificationCount.innerText = count;
  });
});