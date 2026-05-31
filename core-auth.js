import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence }
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const auth = getAuth();

// 🔥 CRITICAL: FORCE PERSISTENCE FIRST (MOST IMPORTANT FIX)
await setPersistence(auth, browserLocalPersistence);

// SINGLE GLOBAL AUTH CONTROL
let initialized = false;

export function useAuth(callback) {

if (initialized) return;

initialized = true;

onAuthStateChanged(auth, (user) => {

if (user) {

console.log("AUTH STABLE:", user.uid);
callback(user);

} else {

// DO NOT INSTANTLY KICK OUT (PREVENT LOOP)
setTimeout(() => {

if (!auth.currentUser) {
window.location = "index.html";
}

}, 2500);

}

});

}