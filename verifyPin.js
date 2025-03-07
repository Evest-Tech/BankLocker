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
      console.log("User authenticated:", currentUserId);
    } else {
      console.log("No user is signed in.");
      window.location.href = "login.html"; // Redirect to login page
    }
  });
  
  // ✅ Function to Verify User PIN
  export async function verifyUserPin(userId, enteredPin) {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
    
     
      if (userSnap.exists() && userSnap.data().pin === enteredPin) {
        console.log("PIN verified successfully.");
        return { success: true, message: "PIN verified successfully." };
      } else {
        return { success: false, message: "Invalid PIN." };
      }
    }

    document
    .getElementById("submitBtn")
    .addEventListener("click", async function () {
        const enteredPin = document.getElementById("pin").value.trim();
        if (enteredPin.length === 4) {
            try {
            const result = await verifyUserPin(currentUserId, enteredPin);
            console.log("User PIN verified:", result);
            if (result.success) {
                window.location.href = "dashboard.html";
            } else {
                showModal("Invalid PIN. Please try again.");
            }
            } catch (error) {
            console.error("Error verifying user PIN:", error.message);
            showModal("Failed to verify user PIN. Please try again.");
            }
        } else {
            showModal("Please enter a 4-digit PIN.");
        }
    })