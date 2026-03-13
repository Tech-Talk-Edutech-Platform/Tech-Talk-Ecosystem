import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const appFirebaseConfig = {
  apiKey: "YOUR_APP_API_KEY",
  authDomain: "YOUR_APP_AUTH_DOMAIN",
  projectId: "YOUR_APP_PROJECT_ID",
  storageBucket: "YOUR_APP_STORAGE_BUCKET",
  messagingSenderId: "YOUR_APP_MSG_ID",
  appId: "YOUR_APP_APP_ID",
};

const appInstance = initializeApp(appFirebaseConfig, "appDB");
export const appDb = getFirestore(appInstance);
