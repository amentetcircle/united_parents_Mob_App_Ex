import React, {createContext, useContext, useEffect, useState} from "react";
import {createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword} from "firebase/auth";
import {auth, fsDatabase} from "../Firebase";
import {doc, getDoc, setDoc} from "firebase/firestore";

import "firebase/compat/firestore";
import "firebase/compat/auth";
import {useNavigate} from "react-router-dom";

const userAuthContext = createContext()


export function UserAuthContextProvider({children}) {
    const [user, setUser] = useState("");
    const [isAdmin, setAdmin] = useState(false)
    const navigate = useNavigate();


    function register(email, password) {

        return createUserWithEmailAndPassword(auth, email, password);
    }

    function login(email, password) {
        signInWithEmailAndPassword(auth, email, password).then(async () => {
            // Katharina Zirkler
            try {
                const docRef = doc(fsDatabase, "user", auth.currentUser.uid)
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    const admin = docSnap.data().admin
                    setAdmin(admin)
                } else {
                    alert("No document for this UID");
                }
                navigate("/home")
            } catch (e) {
                alert(e)
            }
        });
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
            login,
                isAdmin
        }}>
            {children}
        </userAuthContext.Provider>
    );
}

export const createUserDocument = async (users, admin) =>{
    if(!users)return;

    const userRef = doc(fsDatabase,"user", users.uid);
    const snapshot = await getDoc(userRef);

    if(!snapshot.exists()){
        await setDoc(userRef, {
            email:users.email,
            userID:users.uid,
            admin: admin
        });
    }
}

export function useUserAuth() {
    return useContext(userAuthContext);
}
