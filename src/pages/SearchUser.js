import React, {useEffect, useState} from "react";
import {collection, query, where, getDocs, doc, getDoc, setDoc} from "firebase/firestore";
import {auth, fsDatabase} from "../Firebase";
import {useCollectionData} from "react-firebase-hooks/firestore";



/**
 * TO DO:
 * get input PLZ, search it in the DB and present result
 * implement API for the radius
 *
 */

function SearchUser() {
    /* Prevent that users can enter more than 5 digits */
    const handleInput = (e) => {
        let maxLength = 5;
        if (e.target.value.length > maxLength) {
            e.target.value = e
                .target
                .value
                .slice(0, maxLength);
        }
    }

    const q = query(collection(fsDatabase, "user"));
    const [m] = useCollectionData(q, {uid: "id"});


    function UserView(props) {
        //get porperties from current document
        const {email, userID} = props.message;
        //check if message from current User
        //const messageTyp = sender_uid === auth.currentUser.uid ? "sent" : "received";
        return (
            <div className="column">
                <div className="zip-result-card">
                    {/* Catch corresponding user profile image from DB
                            and link user to the corresponding user profile on click on the image
                         */}
                    <img className="circle-img" src="https://i.pravatar.cc/200"></img>
                    {/* Catch corresponding user full name from DB  */}
                    <h1>{email}</h1>
                    {/* Catch corresponding user ZIP code from DB  */}
                    <h2>{userID}</h2>
                    {/* Link user to chat page with correspondinh user */}
                    <button onClick={() => openChatNew(userID)} className="send-msg-btn">
                        <span className="material-icons">forum</span>
                    </button>
                </div>
            </div>
        );
    }
    async function openChatNew(props) {
        const chatIDNew = auth.currentUser.uid + props;
        const div = document.getElementById("hs");
        const heading = document.createElement("h1");
        heading.textContent = chatIDNew;
        div.appendChild(heading);


        const chatRef = doc(fsDatabase, "chats", chatIDNew);
        const snapshot = await getDoc(chatRef);

        if (!snapshot.exists()) {
            await setDoc(chatRef, {
                ID1: auth.currentUser.uid,
                ID2: props,
                chatID: chatIDNew
            });
        }

    }



    return (
        <div>
            <div className="search-zip-container" id="hs">
                <form id="zip-code">
                    <input
                        type="number"
                        onInput={handleInput}
                        placeholder="Postleitzahl"
                        className="zip-input"></input>

                    <input
                        list="radius"
                        name="Radius"
                        placeholder="Radius"
                        className="search-radius"></input>

                    <datalist id="radius">
                        <option value="0km"></option>
                        <option value="2km"></option>
                        <option value="5km"></option>
                    </datalist>

                    <button className="zip-button">Suchen</button>
                </form>

                {/*
                TO DO:
                * Move the result list in onSubmit function,
                so that it only shows after clicking on the serach button.
                * Handle output if there are no results!
                * Also handle onClick:
                    * profile image: link to user profile
                    * send message button: link to user chat
                 */}

                {/* Show this only, if there are no results */}
                <div className="content-box no-results">
                    <h1>Keinen User gefunden!</h1>
                    <p>Ändere den Suchradius oder gib eine andere PLZ ein.</p>
                </div>

                {/* Show this depending on the existing number of results */}
                {m && m.map(msg => <UserView key={msg.id} message={msg}/>)}

                <div className="zip-result-row">
                    <div className="column">
                        <div className="zip-result-card">
                            {/* Catch corresponding user profile image from DB
                            and link user to the corresponding user profile on click on the image
                         */}
                            <img className="circle-img" src="https://i.pravatar.cc/200"></img>
                            {/* Catch corresponding user full name from DB  */}
                            <h1>Kendra</h1>
                            {/* Catch corresponding user ZIP code from DB  */}
                            <p>60529 Frankfurt</p>
                            {/* Link user to chat page with correspondinh user */}
                            <button className="send-msg-btn">
                                <span className="material-icons">forum</span>
                            </button>
                        </div>
                    </div>

                    <div className="column">
                        <div className="zip-result-card">
                            <img className="circle-img" src="https://i.pravatar.cc/200"></img>
                            <h1>Benutzername</h1>
                            <p>Postleitzahl Stadt</p>
                            <button className="send-msg-btn">
                                <span className="material-icons">forum</span>
                            </button>
                        </div>
                    </div>

                    <div class="column">
                        <div className="zip-result-card">
                            <img className="circle-img" src="https://i.pravatar.cc/200"></img>
                            <h1>Benutzername</h1>
                            <p>Postleitzahl Stadt</p>
                            <button className="send-msg-btn">
                                <span className="material-icons">forum</span>
                            </button>
                        </div>
                    </div>

                    <div class="column">
                        <div className="zip-result-card">
                            <img className="circle-img" src="https://i.pravatar.cc/200"></img>
                            <h1>Benutzername</h1>
                            <p>Postleitzahl Stadt</p>
                            <button className="send-msg-btn">
                                <span className="material-icons">forum</span>
                            </button>
                        </div>
                    </div>

                    <div class="column">
                        <div className="zip-result-card">
                            <img className="circle-img" src="https://i.pravatar.cc/200"></img>
                            <h1>Vorname Nachname</h1>
                            <p>Postleitzahl Stadt</p>
                            <button className="send-msg-btn">
                                <span className="material-icons">forum</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



export default SearchUser;