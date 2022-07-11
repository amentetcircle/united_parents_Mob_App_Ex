import React, {useState} from "react";

import {auth} from "../Firebase";

import {Alert, Button, Card, Form} from 'react-bootstrap'
import {Link, useNavigate} from 'react-router-dom'
import {createUserDocument} from "../context/UserAuthContext"
import {createUserWithEmailAndPassword} from "firebase/auth"
import {signup} from "./Chat/actions";
import {useDispatch} from "react-redux";

/**
 * Katharina Zirkler
 * */


const Registration = () => {
    const [email,
        setEmail] = useState("")
    const [password,
        setPassword] = useState("")
    const [displayName, setDisplayName] = useState("")
    const [admin, setAdmin] = useState(false)
    const [birthday, setBirthday] = useState("")
    const [university, setUniversity] = useState("Fra-UAS")
    const [error,
        setError] = useState("")
    const navigate = useNavigate()
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const {user} = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            )
            await createUserDocument(user, admin, birthday, university, displayName).then(() => {
                dispatch(signup({email, password, displayName})) // Maximilian Fay
            })

            if (admin) {
                // if new account applies for administrator, (pretend to) send Email to super-admin
                const body = email + " von der " + university +
                    " möchte gerne Redakteur für United Parents werden.\nlocalhost:3000/verifyadmin/" + user.uid + "\n\n" +
                    "For testing purposes, please copy the link into your browser while the program is still running" +
                    " and pretend you received this e-mail as a super-admin"

                window.location.href = "mailto:mobappex.project@gmail.com?subject=Neue Anfrage Redakteur&body=" + encodeURIComponent(body)
            }
            navigate("/")
        } catch (err) {
            setError(err.message)
        }
    }


    const toggleAdmin = () => {
        // resets input fields unnecessary for admins, if admin registration is chosen instead
        setAdmin(!admin)
        setDisplayName("")
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
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        required
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}/>
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

                        <div className="d-grid gap-2">
                            <Button className="w-100" varient="primary" type="register">Registrieren</Button>
                        </div>

                    </Form>

                </Card.Body>
                {admin ?
                    // opens user registration
                    <div className="w-100 text-center mt-2">
                        Du möchtest einen User Account beantragen?<br></br>
                        <Link to="/registration" onClick={() => toggleAdmin()}>User registrieren</Link>
                    </div>
                    :
                    // opens admin registration
                    <div className="w-100 text-center mt-2">
                        Du möchtest einen Redakteur Account beantragen?<br></br>
                        <Link to="/registration" onClick={() => toggleAdmin()}>Redakteur werden</Link>
                    </div>
                }
                {/*opens login*/}
                <div className="w-100 text-center mt-2">
                    Du hast bereits einen Account?<br></br>
                    <Link to="/">Log dich hier ein</Link>
                </div>
            </Card>

        </div>
    )
}


export default Registration;
