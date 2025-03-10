// Import Firebase SDK
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
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
const db = getFirestore(app);

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

// Ensure balance exists in localStorage (initialize if not set)
if (localStorage.getItem("balance") === null) {
    localStorage.setItem("balance", "0");  // Default balance is 0
}

// Modal elements
const messageModal = document.getElementById("messageModal");
const modalMessage = document.getElementById("modalMessage");
const closeModal = document.getElementById("closeModal");

// Function to show the modal with a message
function showModal(message) {
    modalMessage.textContent = message; // Set the message inside the modal
    messageModal.style.display = 'flex'; // Show the modal
}

// Close modal when the "Close" button is clicked
closeModal.addEventListener('click', function () {
    messageModal.style.display = 'none'; // Hide the modal
});

// Logout Function
document.getElementById("logoutBtn").addEventListener("click", async function () {
    try {
        await signOut(auth); // Firebase sign out
        showModal("User logged out successfully!");


        // Redirect to login page
        window.location.href = "index.html";
    } catch (error) {
        console.error("Logout Error:", error.message);
        showModal("Failed to log out. Please try again.");
    }
});

function handleAction(actionType) {
    const inputFormContainer = document.getElementById("inputFormContainer");
    const amountField = document.getElementById("amount");
    const submitAction = document.getElementById("submitAction");

    // Show input form dynamically
    inputFormContainer.style.display = "block";

    // Hide amount field for check balance action
    amountField.style.display = actionType === 'checkBalance' ? "none" : "block";

    // Remove existing event listeners by replacing the button
    const newSubmitButton = submitAction.cloneNode(true);
    submitAction.replaceWith(newSubmitButton);

    newSubmitButton.addEventListener("click", function () {
        const dashBoardPin = document.getElementById("dashBoardPin").value;
        const amount = parseFloat(amountField.value) || 0; // Ensure amount is a number
        let currentBalance = parseFloat(localStorage.getItem("balance")) || 0; // Convert balance to number

        console.log(`Current Balance: ${currentBalance}, Entered Amount: ${amount}`); // Debugging

        if (verifyUserPin(currentUserId, dashBoardPin)) {
            if (actionType === 'withdraw') {
                // if (amount <= 0) {  
                //     showModal("Cannot withdraw. Amount must be greater than 0."); // Error for zero/negative input
                // } else if (amount > currentBalance) {
                //     showModal("Invalid amount or insufficient funds."); // Error for insufficient balance
                // } else {
                //     currentBalance -= amount;
                //     localStorage.setItem("balance", currentBalance.toString());
                //     showModal("Withdrawal successful!");
                // }
                withdraw(currentUserId, amount).then((result) => {
                    if (result.success) {
                        showModal(result.message);
                    } else {
                        showModal("Failed to withdraw. Please try again.");
                    }
                }
                );
            }
             else if (actionType === 'deposit') {
                // if (amount > 0) {
                //     currentBalance += amount;
                //     // localStorage.setItem("balance", currentBalance.toString());
                    
                //     showModal("Deposit successful!");
                // } else {
                //     showModal("Invalid amount.");
                // }

                deposit(currentUserId, amount).then((result) => {
                    if (result.success) {
                        showModal(result.message);
                    } else {
                        showModal("Failed to deposit. Please try again.");
                    }
                }
                );
            } else if (actionType === 'checkBalance') {
                // showModal(`Your balance is $${currentBalance}`);
                checkBalance(currentUserId).then((result) => {
                    if (result.success) {
                        showModal(`Your balance is $${result.balance}`);
                    } else {
                        showModal("Failed to check balance. Please try again.");
                    }
                }
                );
            }
        } else {
            showModal("Invalid PIN.");
        }

        // Hide input form after the action
        inputFormContainer.style.display = "none";
    });

    // Cancel button functionality
    document.getElementById("cancelAction").addEventListener("click", function () {
        inputFormContainer.style.display = "none";
    });
}


// Event listeners for action buttons
document.getElementById("withdraw").addEventListener("click", function () {
    document.getElementById("dashBoardPin").value = "";
    document.getElementById("amount").value = "";
    handleAction('withdraw');
});
document.getElementById("deposit").addEventListener("click", function () {
    document.getElementById("dashBoardPin").value = "";
    document.getElementById("amount").value = "";
    handleAction('deposit');
});
document.getElementById("checkBalance").addEventListener("click", function () {
    document.getElementById("dashBoardPin").value = "";
    document.getElementById("amount").value = "";
    handleAction('checkBalance'); // Call check balance action
});


// ✅ Prevent Redirection Loop
onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User signed in:", user);
      // if (window.location.pathname !== "/index.html") {  
      //   window.location.href = "index.html"; // Redirect only if not already there
      // }
    } else {
      console.log("No user is signed in.");
      if (window.location.pathname === "/dashboard.html") {
        window.location.href = "index.html"; // Redirect back to login page if logged out
      }
    }
  });




  export async function deposit(userId, amount) {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
  
    if (!userSnap.exists()) return { success: false, message: "User not found." };
    let currentBalance = userSnap.data().balance || 0;
    currentBalance += amount;
  
    await updateDoc(userRef, { balance: currentBalance });
    return { success: true, message: "Deposit successful." };
  }
  
  // ✅ Function to Withdraw Money
  export async function withdraw(userId, amount) {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
  
    if (!userSnap.exists()) return { success: false, message: "User not found." };
    let currentBalance = userSnap.data().balance || 0;
  
    if (amount > currentBalance) {
      return { success: false, message: "Insufficient balance." };
    }
  
    currentBalance -= amount;
    await updateDoc(userRef, { balance: currentBalance });
    return { success: true, message: "Withdrawal successful." };
  }
  
  // ✅ Function to Check Balance
  export async function checkBalance(userId) {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
  
    if (!userSnap.exists()) return { success: false, message: "User not found." };
    return { success: true, balance: userSnap.data().balance };
  }

  
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