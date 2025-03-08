// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
  getAuth,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
 
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBptxk_veDwyvqLR8gv2PQiHJV9WvoVea0",
  authDomain: "banklocker-c59ab.firebaseapp.com",
  projectId: "banklocker-c59ab",
  storageBucket: "banklocker-c59ab.firebasestorage.app",
  messagingSenderId: "803246202551",
  appId: "1:803246202551:web:9bfdf75c835b989ab6b732",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);


// ✅ Handle Google Sign-In
async function handleGoogleSignIn() {
  try {
    const result = await signInWithPopup(auth, provider);
    // console.log("User signed in with Google:", result.user);
    createUserIfNotExists(result.user.uid);
  } catch (error) {
    // console.error("Google Sign-In Error:", error.message);
  }
}

// ✅ Handle Sign-Up with Email & Password
async function SignUpHandler(event) {
  event.preventDefault();

  const email = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email.includes("@")) {
    showSuccessModal("Please enter a valid email address.");
    return;
  }

  try {
    console.log("🚀 Attempting Signup with:", email);

    // ✅ Firebase Signup
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    showSuccessModal("Signup Successful!");
    setTimeout(() => {
      window.open("setPin.html", "_blank");
    }, 2000);
  } catch (error) {
    // console.error("❌ Signup Error:", error.code, error.message);
    showSuccessModal(`Error: ${error.message}`);
  }
}

// ✅ Handle Login with Email & Password
async function LoginHandler(event) {
  event.preventDefault();

  const email = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    // console.log("User logged in:", userCredential.user);
    showSuccessModal("Login Successful!");
    setTimeout(() => {
      window.open("verifyPin.html", "_blank");
    }, 2000);
  } catch (error) {
    // console.error("Login Error:", error.code, error.message);
    showSuccessModal("Invalid email or password");
  }
}

// ✅ Toggle Between Login & Signup
let isSignup = false;
document
  .getElementById("toggleAuth")
  .addEventListener("click", function (event) {
    event.preventDefault();
    isSignup = !isSignup;
    document.getElementById("authTitle").textContent = isSignup
      ? "Sign Up"
      : "Login";
    document.getElementById("toggleText").textContent = isSignup
      ? "Already have an account?"
      : "Don't have an account?";
    document.getElementById("toggleAuth").textContent = isSignup
      ? "Login"
      : "Sign Up";
  });

// ✅ Form Submission
document
  .getElementById("authForm")
  .addEventListener("submit", function (event) {
    if (isSignup) {
      SignUpHandler(event);
    } else {
      LoginHandler(event);
    }
  });

// ✅ Google Sign-In Button
const googleSignInButton = document.getElementById("submitBtn");
if (googleSignInButton) {
  googleSignInButton.addEventListener("click", handleGoogleSignIn);
}

function showSuccessModal(message) {
  const modal = document.getElementById("successModal");
  const modalMessage = document.getElementById("modalMessage");

  modalMessage.textContent = message;
  modal.classList.remove("hidden"); // Show modal

  // Ensure no lingering styles affect it
  modal.style.display = "flex";  
  modal.style.opacity = "1";

  setTimeout(() => {
    modal.style.opacity = "0"; 
    setTimeout(() => {
      modal.classList.add("hidden");
      modal.style.display = "none"; // Fully hide after transition
    }, 300); // Wait for opacity transition
  }, 2000);
}




// ✅ Function to Create User in Firestore
export async function createUserIfNotExists(userId) {
  if (!userId) {
    // console.error("User ID is undefined. Cannot create user.");
    return { success: false, message: "User not logged in." };
  }

  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    // console.log("User already exists in Firestore.");
    window.location.href = "verifyPin.html";
    // Redirect to verifyPin.html
    return { success: true, message: "User already exists." };
  }

  try {
    await setDoc(userRef, {
      pin: null, // User will set this later
      balance: 0, // Default balance
    });
    // console.log("New user created in Firestore.");
      window.location.href = (
        "setPin.html");
    return { success: true, message: "User created successfully." };
  } catch (error) {
    // console.error("Error creating user: ", error);
    return { success: false, message: "Error creating user." };
  }
}