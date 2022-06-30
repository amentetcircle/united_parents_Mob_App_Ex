import React, {useEffect, useState} from "react";

import {collection, onSnapshot, query, where} from "firebase/firestore";
import {fsDatabase} from "../../../Firebase";
import {streamChats1} from "./Firestore/firestore";
import Messages from "../Messages";


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
        <div key={i}>{m.ID2}
        <button onClick={()=> setChatIDNew(m.chatID)}>CLick</button>
    </div>)

    return (
        <div>
            <di>{ChatElements1}</di>

            <Messages chatID={chatIDNew}/>
        </div>
    );
}

export default OpenChat1;