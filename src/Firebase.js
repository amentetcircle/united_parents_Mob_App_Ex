// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
//Katharina
import { getDatabase } from "firebase/database";
//Max
import {getFirestore} from 'firebase/firestore'
//const admin = require('firebase-admin');


const firebaseConfig = {
    apiKey: "AIzaSyDMz9EG3to0JqhBlajH8n1aJ2afaUJn-28",
    authDomain: "mobappex-group3.firebaseapp.com",
    databaseURL: "https://mobappex-group3-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "mobappex-group3",
    storageBucket: "mobappex-group3.appspot.com",
    messagingSenderId: "260127703464",
    appId: "1:260127703464:web:6736f73910241352f75d9d"
};


const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
// Katharina
export const rtDatabase = getDatabase(app);
//Max
export const fsDatabase = getFirestore();

//export const adminAuth = admin.auth()



export default app;
