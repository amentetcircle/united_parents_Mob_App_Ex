//import Data from "bootstrap/js/src/dom/data";
import React, {useEffect, useState} from "react";

//Maximilian Fay
import "firebase/compat/firestore";
import "firebase/compat/auth";
import  {db, auth} from "../Firebase";
import {collection, getDocs, addDoc, orderBy, query, limit} from "firebase/firestore";
import firebase from "firebase/compat/app";
import {getAuth} from "firebase/auth";
import {useCollectionData} from "react-firebase-hooks/firestore";



//Maximilian Fay
function Chats() {
    const [messages, setMessage] = useState([]);
    const messagesCollectionRef = collection(db, "messages");
    const [newMessage, setNewMessage] = useState("");
    const q = query(messagesCollectionRef, orderBy("createdAt"), limit(25));
    const [m] = useCollectionData(q, {uid: "id"});

    /* const getMessage = async () => {

         //const data = await getDocs(messagesCollectionRef)
         //setMessage(data.docs.map((doc) => ({...doc.data(), id: doc.id})))
     };
     useEffect(() => {
         getMessage();

     },[]);*/

    function ChatMessage(props) {
        const {text, sender_uid} = props.message;
        const messageTyp = sender_uid === auth.currentUser.uid ? "sent" : "received";

        return (
            <div className={`message ${messageTyp}`}>
                <p>{text} , {messageTyp}</p>
            </div>
        )
    }

    const sendMessage = async (e) => {
        e.preventDefault();
        const auth = getAuth();
        const userID = auth.currentUser
        await addDoc(messagesCollectionRef, {
            text: newMessage,
            sender_uid: userID.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })

        //setNewMessage("");
    }

    return (


        <div>
            {m && m.map(msg => <ChatMessage key={msg.id} message={msg}/>)}

            <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}/>
            <button onClick={sendMessage}>submit</button>

        </div>


    );
}
//Maximilian Fay

/*function CreateChat() {
    return (
        <div>
            <div id="specific-chat" className="chat-box">
                <div className="floating-heading">
                    <div className="chat-heading">
                        <div className="image-holder">
                            <img className="round-image-for-specific-chat" src="https://i.pravatar.cc/200"></img>
                        </div>
                        <p className="person-name">Username</p>
                        <button onClick={()=>receiverMessage("Message is much muhc longer")}>Receiver</button>
                        <button onClick={()=>senderMessage("Message is much  longer")}>Sender</button>
                    </div>
                </div>
                <div className="message">
                    <p className="message-text">
                        Das ist eine sehr lange Nachricht mit einem Zeitstempel drunte.
                    </p>
                    <p className="timestemp-chat">10:45</p>
                </div>
            </div>
            <textarea name="textarea" row="5" className="message-input" id="messageInput"/>
            <button className="send-msg-btn-chat" onClick={()=>senderMessage()}>
                <span className="material-icons">forum</span>
            </button>
        </div>
    );
}

function receiverMessage(messageText) {

    const tag = document.createElement("div");
    tag.className = "message";

    const message = document.createElement("p");
    message.textContent = messageText;
    message.className = "message-text";

    const messageTimestemp = document.createElement("p");
    messageTimestemp.textContent = "10:25";
    messageTimestemp.className = "timestemp-chat";

    const element = document.getElementById("specific-chat");
    tag.appendChild(message);
    tag.appendChild(messageTimestemp)
    element.appendChild(tag);

    window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "auto" });
}

function senderMessage(messageText=null) {
    const tag = document.createElement("div");
    tag.className = "message sender";

    const input = document.getElementById("messageInput");

    const message = document.createElement("p");
    if(messageText==null) {
        if(input.value.isEmpty) {
            return;
        }
        message.textContent = input.value;
        input.value = "";
    } else {
        message.textContent = messageText;
    }
    message.className = "message-text";

    const messageTimestemp = document.createElement("p");
    messageTimestemp.textContent = "10:25";
    messageTimestemp.className = "timestemp-chat";

    const element = document.getElementById("specific-chat");
    tag.appendChild(message);
    tag.appendChild(messageTimestemp)
    element.appendChild(tag);

    window.scrollTo(0, document.body.scrollHeight);
}*/

export default Chats;