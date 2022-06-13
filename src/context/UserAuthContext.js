import React, {useContext, useState, useEffect, createContext} from "react";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged} from "firebase/auth";
import {auth, fsDatabase} from "../Firebase";
import {getDoc, doc, setDoc, addDoc} from "firebase/firestore";

import "firebase/compat/firestore";
import "firebase/compat/auth";

const userAuthContext = createContext();

export function UserAuthContextProvider({children}) {
    const [user, setUser] = useState("");




    function register(email, password) {

        return createUserWithEmailAndPassword(auth, email, password);
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log(currentUser);
            setUser(currentUser);
        });
        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <userAuthContext.Provider
            value={{
            user,
            register,
            login
        }}>
            {children}
        </userAuthContext.Provider>
    );
}

export const createUserDocument = async (users, additionalData) =>{
    if(!users)return;

    const userRef = doc(fsDatabase,"user", users.uid);
    const snapshot = await getDoc(userRef);

    if(!snapshot.exists()){
        await setDoc(userRef, {
            email:users.email,
            userID:users.uid
        });
    }
}

export function useUserAuth() {
    return useContext(userAuthContext);
}
