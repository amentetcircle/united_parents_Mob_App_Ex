import React, {useEffect, useState} from "react";

import {addDoc, collection, onSnapshot, query, where} from "firebase/firestore";
import {auth, fsDatabase} from "../../../Firebase";
import {streamChats1, streamChats2} from "./Firestore/firestore";
import Messages from "../Messages";
import firebase from "firebase/compat/app";

var globalChatID = null

function OpenChat2(props) {

    const [showMessages, setShowMessages] = useState(false);
    const [chatIDNew, setChatIDNew] = useState("");

    //const {chatID} = props.currentID;
    const [chats, setChats] = useState([]);
    const [error, setError] = useState();



    streamChats2(props.currentID, (querySnapshot) => {
            const updateMessageItem = querySnapshot.docs.map(docSnapshot => docSnapshot.data());
            setChats(updateMessageItem);
        },
        (error) => setError('Load Messages failed')
    );

    const ChatElements2 = chats.map((m, i) =>
        <div className="chat-overview" onClick={() => globalChatID = m.chatID}>
            <img className="round-image" src="https://i.pravatar.cc/200"></img>
            <div className="text-wrapper-overview">
                <p className="user-name">{m.ID1}</p>
                {/*<p className="last-message">{this.lastMessage.text}</p>*/}
                <p className="timestamp-overview">{"this.lastDate"}</p>
            </div>
        </div>
    );
    return (
        <div>
            <di>{ChatElements2}</di>
            <Messages chatID={globalChatID}/>
        </div>
    );
}

export default OpenChat2;