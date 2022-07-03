import React, {useState} from "react";

import {fsDatabase} from "../Firebase";
import {useNavigate, useParams} from 'react-router-dom'
import {deleteDoc, doc, getDoc, updateDoc} from "firebase/firestore";

const VerifyAdmin = () => {

    const {uid} = useParams()
    const [email, setEmail] = useState("")
    const navigate = useNavigate()

    getDoc(doc(fsDatabase, "user", uid)).then((snap) => {
        setEmail(snap.data().email)
    })

    const approve = async () => {
        try {
            await updateUserDoc()
        } catch (e) {
            alert(e)
        }
        navigate("/")
    }

    const reject = async () => {
        await removeUser()
        navigate("/")
    }

    const updateUserDoc = async () => {
        try {
            const data = {
                admin: true,
                verified: true
            }

            await updateDoc(doc(fsDatabase, "user", uid), data)

        } catch (e) {
            console.log(e)
        }
    }

    const removeUser = async () => {
        await deleteDoc(doc(fsDatabase, "user", uid))

        // todo: delete user from auth ??
    }

    return (
        <div>
            <h1>{email} möchte Admin werden</h1>
            <button className="verifyadmin-button zip-button" onClick={approve}>Akzeptieren</button>
            <button className="verifyadmin-button zip-button" onClick={reject}>Ablehnen</button>
        </div>)
}

export default VerifyAdmin