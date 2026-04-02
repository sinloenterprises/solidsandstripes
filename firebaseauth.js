// firebaseauth.js - Updated to remove phone verification
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import {
  getFirestore,
  setDoc,
  doc,
  getDocs,
  collection,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC39UGkNhkYaRIOWCP6FBU7kHxs28OX_kY",
  authDomain: "solids-and-stripes.firebaseapp.com",
  projectId: "solids-and-stripes",
  storageBucket: "solids-and-stripes.firebasestorage.app",
  messagingSenderId: "915996630319",
  appId: "1:915996630319:web:e4f104cd83861d9d77d5da"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// Simple UI message helper
function showMessage(message, divId) {
  const messageDiv = document.getElementById(divId);
  if (!messageDiv) {
    console.log('[showMessage]', divId, message);
    return;
  }
  messageDiv.textContent = message;
  messageDiv.style.display = "block";
  messageDiv.style.opacity = 1;
  setTimeout(function () {
    messageDiv.style.opacity = 0;
  }, 5000);
}

// Utility phone validation helper
function isValidPhone(phone) {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Click handler on Sign Up
const signupBtn = document.getElementById('submitSignUp');
if (signupBtn) {
  signupBtn.addEventListener('click', async (event) => {
    event.preventDefault();
    const email = document.getElementById('rEmail').value;
    const password = document.getElementById('rPassword').value;
    const firstName = document.getElementById('fName').value;
    const lastName = document.getElementById('lName').value;
    let phone = document.getElementById('rPhone').value;

    // Basic validation
    if (!email || !password || !firstName || !lastName || !phone) {
      showMessage('Please fill in all fields', 'signUpMessage');
      return;
    }
    if (!window.isValidEmail(email)) {
      showMessage('Please enter a valid email address', 'signUpMessage');
      return;
    }
    phone = phone.replace(/\s/g, '');
    if (!isValidPhone(phone)) {
      showMessage('Please enter a valid phone number (include +countryCode)', 'signUpMessage');
      return;
    }
    if (password.length < 6) {
      showMessage('Password must be at least 6 characters long', 'signUpMessage');
      return;
    }

    try {
      // Create user account with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Save user data to Firestore
      const userDoc = {
        email: email,
        firstName: firstName,
        lastName: lastName,
        phone: phone
      };
      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, userDoc);
      
      showMessage('Account created successfully! Please sign in.', 'signUpMessage');
          
      // Switch to sign in form after a brief delay
      setTimeout(() => {
        document.getElementById('signup').style.display = "none";
        document.getElementById('signIn').style.display = "block";
      }, 2000);
      
    } catch (error) {
      console.error('Error during sign up:', error);
      showMessage('Error creating account: ' + error.message, 'signUpMessage');
      
    }
  });
}

// Sign in code
const signIn = document.getElementById('submitSignIn');
if (signIn) {
  signIn.addEventListener('click', async (event) => {
    event.preventDefault();
    const emailOrPhone = document.getElementById('emailOrPhone').value;
    const password = document.getElementById('password').value;
    
    if (!emailOrPhone || !password) {
      showMessage('Please fill in all fields', 'signInMessage');
      return;
    }
    
    const isEmail = window.isValidEmail(emailOrPhone);
    const isPhone = isValidPhone(emailOrPhone.replace(/\s/g, ''));

    if (isEmail) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, emailOrPhone, password);
        showMessage('Login is Successful', 'signInMessage');
        const user = userCredential.user;
        localStorage.setItem('loggedInUserId', user.uid);
        window.location.href = 'solidsandstripes.html';
      } catch (error) {
        console.error('Email sign-in error', error);
        showMessage('Incorrect Email or Password or account does not exist', 'signInMessage');
      }
    } else if (isPhone) {
      // find user by phone and sign in by their email/password
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("phone", "==", emailOrPhone));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          showMessage('No account found with this phone number', 'signInMessage');
          return;
        }
        let userEmail = null;
        querySnapshot.forEach((doc) => { userEmail = doc.data().email; });
        if (userEmail) {
          const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
          showMessage('Login is Successful', 'signInMessage');
          const user = userCredential.user;
          localStorage.setItem('loggedInUserId', user.uid);
          window.location.href = 'solidsandstripes.html';
        }
      } catch (err) {
        console.error('Phone sign-in error', err);
        showMessage('Incorrect Phone Number or Password', 'signInMessage');
      }
    } else {
      showMessage('Please enter a valid email address or phone number', 'signInMessage');
    }
  });
}

// Forgot password functionality
const forgotPassword = document.getElementById('forgotPassword');
if (forgotPassword) {
  forgotPassword.addEventListener('click', async (event) => {
    event.preventDefault();
    const email = prompt('Please enter your email address:');
    if (email) {
      try {
        await sendPasswordResetEmail(auth, email);
        showMessage('Password reset email sent!', 'resetMessage');
      } catch (error) {
        console.error('Error sending password reset email:', error);
        showMessage('Error sending password reset email: ' + error.message, 'resetMessage');
      }
    }
  });
}

