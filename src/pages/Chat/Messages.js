import React, {useEffect, useState} from "react";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import  {fsDatabase, auth, adminAuth} from "./../../Firebase";
import {collection, query, where, getDocs, addDoc, doc, getDoc, setDoc, onSnapshot} from "firebase/firestore";
import {streamChats1} from "./OpenChat/Firestore/firestore";
import firebase from "firebase/compat/app";

export const streamMessages = (chatID, snapshot, error) =>{
    const messagesRefNew = collection(fsDatabase, "messages");
    const qMes = query(messagesRefNew, where("chatID", "==", chatID));
    return onSnapshot(qMes, snapshot, error)
}


function Messages(props) {
    const [newMessage, setNewMessage] = useState("");
    const messagesRef = collection(fsDatabase, "messages");
    const chatIDGlob = props.chatID;

    const sendMessage = async (e) => {
        e.preventDefault();
        //const auth = getAuth();
        //get current user object
        const user = auth.currentUser


        //add document to collection
        await addDoc(messagesRef, {
            text: newMessage,
            sender_uid: user.uid,
            chatID:chatIDGlob,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })

        setNewMessage("");

    }

        //const {chatID} = props.currentID;
        const [messages, setMessages] = useState([]);
        const [error, setError] = useState();

        streamMessages(props.chatID, (querySnapshot) => {
                const updateMessageItem = querySnapshot.docs.map(docSnapshot => docSnapshot.data());
                setMessages(updateMessageItem);
            },
            (error) => setError('Load Messages failed')
        );


        const MessageElements = messages.map((m, i) => <div key={i}>{m.text}</div>)

        return (
            <div>
                <di>{MessageElements}</di>
                <div>
                    <textarea value={newMessage} onChange={(e) => setNewMessage(e.target.value)}/>
                    <button onClick={sendMessage}>Send</button>
                </div>

            </div>
        );
}

export default Messages;