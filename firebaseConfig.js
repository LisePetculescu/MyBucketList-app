import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5W9YKYshe4znSAPSHAM9pMr_C0aws9oQ",
  authDomain: "bucketlist-app-db.firebaseapp.com",
  projectId: "bucketlist-app-db",
  storageBucket: "bucketlist-app-db.appspot.com",
  messagingSenderId: "546701675762",
  appId: "1:546701675762:web:7c98798becca567bf3146b",
  measurementId: "G-V63CFG5D7R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const firestore = getFirestore(app);

export { firestore };
