import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot, where } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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
  if (!user) return window.location.href = "login.html";

  const q = query(
    collection(db, "notifications"),
    orderBy("createdAt", "desc"),
    where("userId", "in", [user.uid, "all"])
  );

  onSnapshot(q, snapshot => {
    notificationList.innerHTML = "";
    let count = 0;

    snapshot.forEach(doc => {
      const notif = doc.data();
      const card = document.createElement("div");
      card.className = "notification-card";
      card.innerHTML = `
        <strong>${notif.title || "Notification"}</strong>
        <p>${notif.message}</p>
        ${notif.imageUrl ? `<img src="${notif.imageUrl}" class="mt-2 rounded w-48">` : ""}
      `;
      notificationList.appendChild(card);
      count++;
    });

    notificationCount.innerText = `You have ${count} notification${count !== 1 ? "s" : ""}`;
  });
});