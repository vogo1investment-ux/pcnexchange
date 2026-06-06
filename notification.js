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

const notificationsList = document.getElementById("notificationsList");
const notifCountElem = document.getElementById("notifCount");

onAuthStateChanged(auth, user => {
  if (!user) return window.location.href = "login.html";

  const userId = user.uid;

  // Listen to notifications for this user or broadcast messages
  const notifRef = collection(db, "notifications");
  const q = query(
    notifRef,
    where("userId", "in", [userId, "all"]),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, snapshot => {
    notificationsList.innerHTML = "";
    notifCountElem.textContent = snapshot.size;

    snapshot.forEach(doc => {
      const data = doc.data();
      const div = document.createElement("div");
      div.className = "p-4 border border-green-500 rounded bg-zinc-900";
      div.innerHTML = `
        <h3 class="font-bold text-emerald-400">${data.title || "Notification"}</h3>
        <p>${data.message || ""}</p>
        ${data.imageUrl ? `<img src="${data.imageUrl}" alt="Notification Image" class="mt-2 rounded max-w-full">` : ""}
        <small class="text-gray-400">${data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : ""}</small>
      `;
      notificationsList.appendChild(div);
    });
  });
});