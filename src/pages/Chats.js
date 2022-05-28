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




function Chats() {
    const [messages, setMessage] = useState([]);
    const messagesCollectionRef = collection(db, "messages");
    const [newMessage, setNewMessage] = useState("");
    const q = query(messagesCollectionRef,orderBy("createdAt"),limit(25));
    const [m] = useCollectionData(q, {uid: "id"});

   /* const getMessage = async () => {

        //const data = await getDocs(messagesCollectionRef)
        //setMessage(data.docs.map((doc) => ({...doc.data(), id: doc.id})))
    };
    useEffect(() => {
        getMessage();

    },[]);*/

    function ChatMessage(props){
        const {text, uid} = props.message;
        const messageTyp = uid === auth.currentUser.uid ? "sent" : "received";

        return (
            <div className={`message ${messageTyp}`}>
                <p>{text} , {messageTyp}</p>
            </div>
        )
    }

    const sendMessage = async (e) =>{
        e.preventDefault();
        const auth = getAuth();
        const userID = auth.currentUser
        await addDoc(messagesCollectionRef,{text:newMessage, sender_uid: userID.uid, createdAt:firebase.firestore.FieldValue.serverTimestamp()})

        setNewMessage("");
    }

    return (


        <div>
                {m && m.map(msg => <ChatMessage key={msg.id} message={msg}/>)}

               <input value={newMessage} onChange={(e) =>setNewMessage(e.target.value)}/>
               <button onClick={sendMessage}>submit</button>

        </div>



    );

}

export default Chats;