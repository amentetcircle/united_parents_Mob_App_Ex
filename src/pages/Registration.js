import React, {useState} from "react";

import {auth} from "../Firebase";

import {Alert, Button, Card, Form} from 'react-bootstrap'
import {Link, useNavigate} from 'react-router-dom'
import {createUserDocument, useUserAuth} from "../context/UserAuthContext"
import {createUserWithEmailAndPassword} from "firebase/auth"


const Registration = () => {
    const [email,
        setEmail] = useState("")
    const [password,
        setPassword] = useState("")
    const [displayName, setDisplayName] = useState("")
    const [admin, setAdmin] = useState(false)
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [birthday, setBirthday] = useState("")
    const [university, setUniversity] = useState("Fra-UAS")
    const {register} = useUserAuth()
    const [error,
        setError] = useState("")
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            if (admin) {
                const body = email + " von der " + university +
                    " möchte gerne Admin für United Parents werden.\nErlauben? /akzeptierLink/\nVerwerfen? /ablehnLink/"

                window.location.href = "mailto:k.zirkler@gmx.net?subject=Neue Anfrage Admin&body=" + encodeURIComponent(body)
            }

            const {user} = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            )
            await createUserDocument(user, admin, firstName, lastName, birthday, university)

            navigate("/")
        } catch (err) {
            setError(err.message)
        }
    }


    // Katharina Zirkler
    // const handleCheckbox = (event) => {
    //     setAdmin(event.target.checked)
    // }

    const toggleAdmin = () => {
        setAdmin(!admin)
        setFirstName("")
        setLastName("")
        setBirthday("")
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
                                required
                                type="email"
                                placeholder="E-Mail Adresse"
                                onChange={(e) => setEmail(e.target.value)}/>
                        </Form.Group>

                        <Form.Group id="password">
                            <Form.Label>Passwort</Form.Label>
                            <Form.Control
                                required
                                type="password"
                                placeholder="Passwort"
                                onChange={(e) => setPassword(e.target.value)}/>
                        </Form.Group>

                        <Form.Group id="rePassword">
                            <Form.Label>Passwort Wiederholen</Form.Label>
                            <Form.Control
                                required
                                type="Password"
                                placeholder="Passwort wiederholen"/>
                        </Form.Group>

                        {!admin ?
                            <div>
                                <Form.Group id="firstName">
                                    <Form.Label>Vorname</Form.Label>
                                    <Form.Control
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}/>
                                </Form.Group>

                                <Form.Group id="lastName">
                                    <Form.Label>Nachname</Form.Label>
                                    <Form.Control
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}/>
                                </Form.Group>

                                <Form.Group id="birthday">
                                    <Form.Label>Geburtsdatum</Form.Label>
                                    <Form.Control
                                        required
                                        type="date"
                                        value={birthday}
                                        onChange={(e) => setBirthday(e.target.value)}/>
                                </Form.Group>
                            </div>
                            :
                            null
                        }

                        <Form.Group id="uniPlace">
                            <Form.Label>Hochschule und Standort</Form.Label>
                            <Form.Control
                                required
                                as="select"
                                value={university}
                                onChange={(e) => setUniversity(e.target.value)}>
                                <option value="FRA-UAS">FRA-UAS</option>
                                <option value="Goethe Uni">Goethe Uni</option>
                            </Form.Control>
                        </Form.Group>

                        {/*Katharina Zirkler*/}
                        {/*<Form.Group id="checkAdmin">*/}
                        {/*    <Form.Label>Als Admin registrieren?</Form.Label>*/}
                        {/*    <Form.Check checked={admin} onChange={handleCheckbox}/>*/}
                        {/*</Form.Group>*/}

                        <div className="d-grid gap-2">
                            <Button className="w-100" varient="primary" type="register">Registrieren</Button>
                        </div>

                    </Form>

                </Card.Body>
                {admin ?
                    <div className="w-100 text-center mt-2">
                        Du möchtest einen User Account beantragen?<br></br>
                        <Link to="/registration" onClick={() => toggleAdmin()}>User registrieren</Link>
                    </div>
                    :
                    <div className="w-100 text-center mt-2">
                        Du möchtest einen Admin Account beantragen?<br></br>
                        <Link to="/registration" onClick={() => toggleAdmin()}>Administrator werden</Link>
                    </div>
                }
                <div className="w-100 text-center mt-2">
                    Du hast bereits einen Account?<br></br>
                    <Link to="/">Log dich hier ein</Link>
                </div>
            </Card>

        </div>
    )
        ;
}

export default Registration;
