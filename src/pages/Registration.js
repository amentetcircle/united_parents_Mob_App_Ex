import React, {useState} from "react";

import  {fsDatabase, auth} from "../Firebase";
import { getDatabase, ref, set } from "firebase/database";

import {Form, Button, Card, Alert} from 'react-bootstrap'
import {Link, useNavigate} from 'react-router-dom'
import {createUserDocument, useUserAuth} from "../context/UserAuthContext"
import {createUserWithEmailAndPassword} from "firebase/auth";

/**
 * TODO: add the following to the form:
 * Vorname
 * Nachname
 * PLZ
 * Hochschule/Standort
 * Studiengang
 * 
 * TODO: send verification E-Mail to the user, only after that a user can login
 */

const Registration = () => {
    const [email,
        setEmail] = useState("")
    const [password,
        setPassword] = useState("")
    const [displayName, setDisplayName] = useState("")
    const {register} = useUserAuth()
    const [error,
        setError] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async(e) => {
        e.preventDefault()

        try {
            const {user} = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            await createUserDocument(user, {displayName});
            navigate("/")
        }catch (err) {
            setError(err.message);

        }
    }



    return (
        <div className="login-container">
            <Card>
                <Card.Body>
                    <h1 className="text-center mb-4">Registrieren</h1>
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form onSubmit={handleSubmit}>

                        <Form.Group id="email">
                            <Form.Label>E-Mail</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="E-Mail Adresse"
                                onChange={(e) => setEmail(e.target.value)}/>
                        </Form.Group>

                        <Form.Group id="password">
                            <Form.Label>Passwort</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Passwort"
                                onChange={(e) => setPassword(e.target.value)}/>
                        </Form.Group>

                        <Form.Group id="rePassword">
                            <Form.Label>Passwort Wiederholen</Form.Label>
                            <Form.Control type="Password" placeholder="Passwort wiederholen"/>
                        </Form.Group>

                        <div className="d-grid gap-2">
                            <Button className="w-100" varient="primary" type="register">Registrieren</Button>
                        </div>

                    </Form>

                </Card.Body>
                <div className="w-100 text-center mt-2">
                    Du hast bereits einen Account?<br></br>
                    <Link to="/">Log dich hier ein</Link>
                </div>
            </Card>

        </div>
    );
}

export default Registration;

/*

            <Form.Group id ="firstName" >
                <Form.Label>Vorname</Form.Label>
                <Form.Control type="firstName" ref = {firstNameref} required/>
            </Form.Group>

            <Form.Group id ="lastName" >
                <Form.Label>Nachname</Form.Label>
                <Form.Control type="lastName" ref = {lastNameRef} required/>
            </Form.Group>

            <Form.Group id ="birthday" >
                <Form.Label>GeburtsDatum</Form.Label>
                <Form.Control type="birthday" ref = {birthdayRef} required/>
            </Form.Group>

            <Form.Group id ="uniPlace" >
                <Form.Label>Hochschule und Standort</Form.Label>
                <Form.Control type="uniPlace" ref = {uniPlaceRef} required/>
            </Form.Group>
*/