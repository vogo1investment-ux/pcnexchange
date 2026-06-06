import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getFirestore, collection, query, where, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
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

let userUid;
const notifList = document.getElementById("notifList");
const notifCount = document.getElementById("notifCount");

onAuthStateChanged(auth, user => {
  if (!user) return window.location.href = "login.html";
  userUid = user.uid;
  listenNotifications();
});

function listenNotifications() {
  const notifRef = collection(db, "notifications");
  // Listen to notifications for this user OR global "all"
  const q = query(
    notifRef,
    where("userId", "in", [userUid, "all"]),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, snapshot => {
    notifList.innerHTML = "";
    notifCount.innerText = snapshot.size;

    snapshot.forEach(doc => {
      const data = doc.data();
      const div = document.createElement("div");
      div.className = "p-4 rounded-xl bg-zinc-900 border border-emerald-500";
      div.innerHTML = `
        <strong class="text-emerald-400">${data.title || "Notification"}</strong>
        <p>${data.message || ""}</p>
        ${data.imageUrl ? `<img src="${data.imageUrl}" class="max-w-xs mt-2 rounded-lg" />` : ""}
        <small class="text-zinc-400">${data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : ""}</small>
      `;
      notifList.appendChild(div);
    });
  });
}