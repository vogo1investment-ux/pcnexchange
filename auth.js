import { getAuth, onAuthStateChanged, setPersistence, browserLocalPersistence }
from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

const auth = getAuth();

// 🔥 FORCE STABLE LOGIN SESSION (THIS IS THE MAIN FIX)
setPersistence(auth, browserLocalPersistence);

// GLOBAL AUTH HANDLER
export function initAuth(callback) {

onAuthStateChanged(auth, (user) => {

if (user) {

console.log("AUTH OK:", user.uid);
callback(user);

} else {

// DO NOT INSTANTLY KICK OUT
setTimeout(() => {

if (!auth.currentUser) {
window.location = "index.html";
}

}, 2000);

}

});

}