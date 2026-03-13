// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

  const firebaseConfig = {
 apiKey: "AIzaSyCpaS7uQMizJBJqr_QGuSlZfNyFspA4Sow",
  authDomain: "tech-talk-hub.firebaseapp.com",
  projectId: "tech-talk-hub",
  storageBucket: "tech-talk-hub.firebasestorage.app",
  messagingSenderId: "457529885849",
  appId: "1:457529885849:web:ae19d7e75df7844f97a408",
  measurementId: "G-4PJB85ENJE"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

