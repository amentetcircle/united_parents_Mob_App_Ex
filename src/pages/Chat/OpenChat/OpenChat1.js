import React, {useEffect, useState} from "react";

import {addDoc, collection, onSnapshot, query, where} from "firebase/firestore";
import {auth, fsDatabase} from "../../../Firebase";
import {streamChats1} from "./Firestore/firestore";
import Messages from "../Messages";
import firebase from "firebase/compat/app";

var globalChatID = null

function OpenChat1(props) {

    const [showMessages, setShowMessages] = useState(false);
    const [chatIDNew, setChatIDNew] = useState("");

    //const {chatID} = props.currentID;
    const [chats, setChats] = useState([]);
    const [error, setError] = useState();



     streamChats1(props.currentID, (querySnapshot) => {
                    const updateMessageItem = querySnapshot.docs.map(docSnapshot => docSnapshot.data());
                    setChats(updateMessageItem);
                },
                (error) => setError('Load Messages failed')
            );

    const ChatElements1 = chats.map((m, i) =>
        <div className="chat-overview" onClick={() => globalChatID = m.chatID}>
            <img className="round-image" src="https://i.pravatar.cc/200"></img>
            <div className="text-wrapper-overview">
                <p className="user-name">{m.ID2}</p>
                {/*<p className="last-message">{this.lastMessage.text}</p>*/}
                <p className="timestamp-overview">{"this.lastDate"}</p>
            </div>
        </div>
    );
    return (
        <div>
            <di>{ChatElements1}</di>
            <Messages chatID={globalChatID}/>
        </div>
    );
}

export default OpenChat1;