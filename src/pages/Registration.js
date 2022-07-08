import React, {useState} from "react";

import  {fsDatabase, auth} from "../Firebase";
import { getDatabase, ref, set } from "firebase/database";

import {Alert, Button, Card, Form} from 'react-bootstrap'
import {Link, useNavigate} from 'react-router-dom'
import {createUserDocument} from "../context/UserAuthContext"
import {createUserWithEmailAndPassword} from "firebase/auth"
import {signup} from "./Chat/actions";
import {useDispatch, useSelector} from "react-redux";

// Katharina Zirkler



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
        //const auth = useSelector(state => state.auth);

        const handleSubmit = async (e) => {
            e.preventDefault()

            // const userN = {email, password, birthday, university, admin, displayName}
            try {
                const {user} = await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                )
                await createUserDocument(user, admin, birthday, university, displayName).then(() =>{
                    dispatch(signup({email, password, firstName, lastName})) // todo: exchange with displayName
                })



                if (admin) {
                    const body = email + " von der " + university +
                        " möchte gerne Redakteur für United Parents werden.\nhttp://localhost:3000/verifyadmin/" + user.uid + "\n\n" +
                        "For testing purposes, please copy the link into your browser while the program is still running" +
                        " and pretend you received this e-mail as a super-admin"

                    window.location.href = "mailto:mobappex.project@gmail.com?subject=Neue Anfrage Redakteur&body=" + encodeURIComponent(body)
                }
                //dispatch(signup({email, password}))
                navigate("/")
            } catch (err) {
                setError(err.message)
            }
        }
        /*if (auth.authenticated) {
            return <Navigate to={`/Chat/ChatPage`}/>
        }*/


        const toggleAdmin = () => {
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
                        <div className="w-100 text-center mt-2">
                            Du möchtest einen User Account beantragen?<br></br>
                            <Link to="/registration" onClick={() => toggleAdmin()}>User registrieren</Link>
                        </div>
                        :
                        <div className="w-100 text-center mt-2">
                            Du möchtest einen Redakteur Account beantragen?<br></br>
                            <Link to="/registration" onClick={() => toggleAdmin()}>Redakteur werden</Link>
                        </div>
                    }
                    <div className="w-100 text-center mt-2">
                        Du hast bereits einen Account?<br></br>
                        <Link to="/">Log dich hier ein</Link>
                    </div>
                </Card>

            </div>
        )
    }


export default Registration;
