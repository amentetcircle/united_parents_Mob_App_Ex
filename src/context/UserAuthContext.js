import React, {createContext, useContext, useEffect, useState} from "react";
import {createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword} from "firebase/auth";
import {auth, fsDatabase} from "../Firebase";
import {doc, getDoc, setDoc} from "firebase/firestore";

import "firebase/compat/firestore";
import "firebase/compat/auth";
import {useNavigate} from "react-router-dom";

const userAuthContext = createContext()


export function UserAuthContextProvider({children}) {
    const [user, setUser] = useState("")
    const [isAdmin, setAdmin] = useState(false)
    const navigate = useNavigate()


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
                    if (docSnap.data().verified) {
                        const admin = docSnap.data().admin
                        setAdmin(admin)
                        // todo: here all other user infos (name, birthday, uni) could be set if needed
                        navigate("/home")

                    } else {
                        alert("E-Mail Adresse noch nicht freigeschalten.")
                        navigate("/")
                    }
                } else {
                    alert("No document for this UID");
                }
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
                isAdmin,
            }}>
            {children}
        </userAuthContext.Provider>
    );
}

export const createUserDocument = async (user, admin, firstName, lastName, birthday, university) => {
    if (!user) return;
    console.log("lets go")
    try {

        const userRef = doc(fsDatabase, "user", user.uid);
        const snapshot = await getDoc(userRef);

        const data = {
            email: user.email,
            userID: user.uid,
            admin: false,
            firstName: firstName,
            lastName: lastName,
            birthday: birthday,
            university: university
        }
        if (admin)
            data.verified = false
        if (!snapshot.exists()) {
            await setDoc(userRef, data);
        }

    } catch (e) {
        console.log(e)
    }
}

export function useUserAuth() {
    return useContext(userAuthContext);
}
