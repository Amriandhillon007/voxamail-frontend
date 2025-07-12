import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBYpr37Gd5VDP99QvLI5KbFYe5pL7JqSFk",
  authDomain: "voxamail-7b7db.firebaseapp.com",
  projectId: "voxamail-7b7db",
  storageBucket: "voxamail-7b7db.appspot.com",
  messagingSenderId: "488037756371",
  appId: "1:488037756371:web:c535d428352abdd9ebd326",
  measurementId: "G-ER4S30PS1W",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ Set persistent auth
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Firebase auth persistence set to localStorage");
  })
  .catch((error) => {
    console.error("❌ Firebase persistence error:", error);
  });

const provider = new GoogleAuthProvider();

// ✅ Add Gmail scopes explicitly
provider.addScope("https://www.googleapis.com/auth/gmail.readonly");
provider.addScope("https://www.googleapis.com/auth/gmail.modify");
provider.addScope("https://www.googleapis.com/auth/gmail.send");


// ✅ Export all required methods
export {
  auth,
  provider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
};
