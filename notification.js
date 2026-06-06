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

const notifList = document.getElementById("notifList");
const notifCount = document.getElementById("notifCount");

onAuthStateChanged(auth, user => {
  if (!user) return window.location.href = "login.html";
  const userId = user.uid;

  // Query notifications where userId is current user or "all" (broadcast)
  const notifRef = collection(db, "notifications");
  const q = query(notifRef, orderBy("createdAt", "desc"));

  onSnapshot(q, snapshot => {
    notifList.innerHTML = "";
    let count = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.userId === userId || data.userId === "all") {
        count++;
        const div = document.createElement("div");
        div.className = "p-4 bg-zinc-900 border border-green-500 rounded-xl";
        div.innerHTML = `
          <strong>${data.title || "Notification"}</strong>
          <p>${data.message || ""}</p>
          ${data.imageUrl ? `<img src="${data.imageUrl}" class="max-h-48 mt-2 rounded">` : ""}
          <small class="text-gray-400">${data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : ""}</small>
        `;
        notifList.appendChild(div);
      }
    });

    notifCount.innerText = count > 0 ? `You have ${count} notification(s)` : "No notifications";
  });
});