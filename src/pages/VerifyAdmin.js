import React, {useState} from "react";

import {auth, fsDatabase} from "../Firebase";
import {useNavigate, useParams} from 'react-router-dom'
import {doc, getDoc, updateDoc} from "firebase/firestore";
import {signInWithEmailAndPassword} from "firebase/auth";
import {Button, Card, Form} from "react-bootstrap";

// all changes on this page by Katharina Zirkler
const VerifyAdmin = () => {

    const {uid} = useParams()
    const [adminEmail, setAdminEmail] = useState("")
    const [supEmail, setSupEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isSupAdmin, setSupAdmin] = useState(false)
    const [name, setName] = useState("")
    const navigate = useNavigate()

    const signOut = () => {
        auth.signOut().then(() => navigate("/"))
    }

    getDoc(doc(fsDatabase, "user", uid)).then((snap) => {
        setAdminEmail(snap.data().email)
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        const {supAdmin} = await signInWithEmailAndPassword(auth, supEmail, password)
        try {
            const docRef = doc(fsDatabase, "user", auth.currentUser.uid)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                if (docSnap.data().superAdmin) {
                    setName(docSnap.data().firstName)
                    setSupAdmin(true)
                } else {
                    alert("Keine Zugriffsrechte.")
                }
            } else {
                alert("No document for this UID");
            }
        } catch (e) {
            alert(e)
        }

    }

    const approve = async () => {
        try {
            const data = {
                verified: true
            }
            await updateDoc(doc(fsDatabase, "user", uid), data)
            const body = "Wir freuen uns, dich als Redakteur im Team begrüßen zu dürfen.\n" +
                "Du kannst dich jetzt mit deinem gewählten Passwort auf unserer Seite einloggen und direkt loslegen!"

            window.location.href = "mailto:" + adminEmail + "?subject=United Parents Administrator&body=" + encodeURIComponent(body)
        } catch (e) {
            alert(e)
        }
        signOut()
    }

    const reject = async () => {
        const body = "Leider konnten dir keine Redakteurrechte gewährt werden.\n\nFalls du mit dieser Entscheidung nicht" +
            "einverstanden bist, wende dich bitte an <...>"

        window.location.href = "mailto:" + adminEmail + "?subject=United Parents Ablehnung Redakteur&body=" + encodeURIComponent(body)
        signOut()
    }

    // const updateUserDoc = async () => {
    //     try {
    //         const data = {
    //             verified: true
    //         }
    //         await updateDoc(doc(fsDatabase, "user", uid), data)
    //     } catch (e) {
    //         console.log(e)
    //     }
    // }

    return (

        !isSupAdmin ?
            <div id="login-container">
                <Card>
                    <Card.Body>
                        <h1 className="text-center mb-4">Login</h1>

                        <Form onSubmit={handleSubmit}>
                            <Form.Group id="email">
                                <Form.Label>E-Mail</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="E-Mail Adresse"
                                    onChange={(e) => setSupEmail(e.target.value)}/>
                            </Form.Group>

                            <Form.Group id="password">
                                <Form.Label>Passwort</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Passwort"
                                    onChange={(e) => setPassword(e.target.value)}/>
                            </Form.Group>

                            <Button className="w-100" type="register">Login</Button>

                        </Form>
                    </Card.Body>
                </Card>
            </div> :
            <div>
                <h2>Hallo {name}!</h2>
                <br/>
                <br/>
                <h1>{adminEmail} möchte Redakteur werden.</h1>
                <h2>Erlauben?</h2>

                <button className="verifyadmin-button zip-button" onClick={approve}>Akzeptieren</button>
                <button className="verifyadmin-button zip-button" onClick={reject}>Ablehnen</button>
            </div>
    )


}

export default VerifyAdmin