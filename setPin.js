import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// ✅ Show Success Modal with Website Styles
function showSuccessModal(message) {
  const modal = document.getElementById("successModal");
  const modalMessage = document.getElementById("modalMessage");

  modalMessage.textContent = message;
  modal.classList.add("show"); // Show the modal

  setTimeout(() => {
      closeModal();
  }, 2000);
}

// ✅ Close Modal Function
function closeModal() {
  const modal = document.getElementById("successModal");
  modal.classList.remove("show"); // Hide modal
}


// ✅ Initialize Firebase
const firebaseConfig = {
  // Your Firebase configuration here
  apiKey: "AIzaSyBptxk_veDwyvqLR8gv2PQiHJV9WvoVea0",
  authDomain: "banklocker-c59ab.firebaseapp.com",
  projectId: "banklocker-c59ab",
  storageBucket: "banklocker-c59ab.firebasestorage.app",
  messagingSenderId: "803246202551",
  appId: "1:803246202551:web:9bfdf75c835b989ab6b732",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


const auth = getAuth();

let currentUserId = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUserId = user.uid;  // ✅ Get User's UID
    // console.log("User authenticated:", currentUserId);
  } else {
    // console.log("No user is signed in.");
    window.location.href = "login.html"; // Redirect to login page
  }
});
// ✅ Function to Set User PIN
export async function setUserPin(userId, pin) {
  const userRef = doc(db, "users", userId);
  try {
    await setDoc(userRef, { pin: pin, balance: 0 });
    showSuccessModal("PIN set successfully.");
    return { success: true, message: "PIN set successfully." };
  } catch (error) {
    showSuccessModal("Invalid PIN");
    return { success: false, message: "Error setting PIN." };
  }
}
document
  .getElementById("submitBtn")
  .addEventListener("click", async function () {
    const userPin = document.getElementById("pin").value.trim();
     // Debugging line
    if (userPin.length === 4) {
      try {
        // console.log("User PIN:", userPin , typeof(Number(userPin)));
        const result = await setUserPin(currentUserId,userPin);
        // console.log("User PIN set:", result);
        showSuccessModal("User PIN set successfully!");
        window.location.href = "dashboard.html";
      } catch (error) {
        // console.error("Error setting user PIN:", error.message);
        showSuccessModal("Failed to set user PIN. Please try again.");
      }
    } else {
      showSuccessModal("Please enter a 4-digit PIN.");
    }
  });
