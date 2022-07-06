import React, {createContext, useContext, useEffect, useState} from "react";
import {createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword} from "firebase/auth";
import {auth, fsDatabase} from "../Firebase";
import {doc, getDoc, setDoc, updateDoc} from "firebase/firestore";

import "firebase/compat/firestore";
import "firebase/compat/auth";
import {useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import {signin} from "../pages/Chat/actions";

const userAuthContext = createContext()


export function UserAuthContextProvider({children}) {
    const [user, setUser] = useState("")
    const [isAdmin, setAdmin] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch();

    function register(email, password) {

        return createUserWithEmailAndPassword(auth, email, password);
    }
    //const dispatch = useDispatch();
    function login(email, password) {
        signInWithEmailAndPassword(auth, email, password).then(async () => {
            // Katharina Zirkler
            try {

                const docRef = doc(fsDatabase, "user", auth.currentUser.uid)
                const docSnap = await getDoc(docRef)
                const uid = auth.currentUser.uid
                await updateDoc(docRef,{
                    isOnline: true
                }).then(()=>{
                    dispatch(signin({ email, password, uid}))
                })

                if (docSnap.exists()) {
                    if (docSnap.data().verified) {
                        const admin = docSnap.data().admin
                        setAdmin(admin)
                        // todo: here all other user infos (name, birthday, uni) could be set if needed
                        //dispatch(signin({ email, password }));
                        navigate("/home")

                    } else {
                        alert("E-Mail Adresse noch nicht freigeschalten.")
                        navigate("/")
                    }
                } else {
                    alert("No document for this UID");
                }
                //dispatch(signin({ email, password }));
                navigate("/home")  // todo: not happy having this here, should be in Login.js / handleSubmit, but works for now
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

// Maximilian Fay & Katharina Zirkler
export const createUserDocument = async (user, admin, firstName, lastName, birthday, university, displayName) => {
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
            university: university,
            displayName: displayName,
            verified: true
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
