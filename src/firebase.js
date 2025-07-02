import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBYpr37Gd5VDP99QvLI5KbFYe5pL7JqSFk",
  authDomain: "voxamail-7b7db.firebaseapp.com",
  projectId: "voxamail-7b7db",
  storageBucket: "voxamail-7b7db.firebasestorage.app",
  messagingSenderId: "488037756371",
  appId: "1:488037756371:web:c535d428352abdd9ebd326",
  measurementId: "G-ER4S30PS1W"
};

// Initialize Firebase


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };