import React from "react";
import {Link, useNavigate} from "react-router-dom";
import {auth} from "../Firebase";
import {useUserAuth} from "../context/UserAuthContext";

function Sidebar() {
    const navigate = useNavigate()
    const {isAdmin} = useUserAuth()

    const signOut = () => {
        auth.signOut().then(() => navigate("/"))
    }
    return (
        <aside className="sidebar">
            <div className="icons">
                <div className="icons-container">
                    <Link to="/home">
                        <span className="material-icons">home</span>
                        <p>Startseite</p>
                    </Link>
                </div>
                {isAdmin ?

                    <div className="icons-container">
                        <span className="material-icons disabled-material-button">account_circle</span>
                        <p>Mein Profil</p>
                    </div>
                    :
                    <div className="icons-container">
                        <Link to="/my-profile">
                            <span className="material-icons">account_circle</span>
                            <p>Mein Profil</p>
                        </Link>
                    </div>
                }
                {isAdmin ?
                    <div className="icons-container">
                        <span className="material-icons disabled-material-button">map</span>
                        <p>User suchen</p>
                    </div>
                    :
                    <div className="icons-container">
                        <Link to="/search-user">
                            <span className=" material-icons">map</span>
                            <p>User suchen</p>
                        </Link>
                    </div>
                }
                {isAdmin ?
                    <div className="icons-container">
                        <span className="material-icons disabled-material-button">forum</span>
                        <p>Chats</p>
                    </div>
                    :
                    <div className="icons-container">
                        <Link to="/chats">
                            <span className="material-icons">forum</span>
                            <p>Chats</p>
                        </Link>
                    </div>
                }

                <div className="icons-container">
                    <Link to="/help-finances">
                        <span className="material-icons">contact_support</span>
                        <p>Hilfe & Finanzen</p>
                    </Link>
                </div>

                {isAdmin ?
                    <div className="icons-container">
                            <span className="material-icons disabled-material-button">settings</span>
                            <p>Einstellungen</p>
                    </div>
                    :
                    <div className="icons-container">
                        <Link to="/settings">
                            <span className="material-icons">settings</span>
                            <p>Einstellungen</p>
                        </Link>
                    </div>
                }

                <div className="icons-container">
                    <a href="#" onClick={signOut}>
                        <span className="material-icons">logout</span>
                        <p>Abmelden</p>
                    </a>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
