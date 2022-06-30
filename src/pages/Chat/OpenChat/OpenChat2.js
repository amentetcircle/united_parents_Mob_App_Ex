import React, {useEffect, useState} from "react";
import {collection, onSnapshot, query, where} from "firebase/firestore";
import {fsDatabase} from "../../../Firebase";
import {streamChats2} from "./Firestore/firestore";
import Messages from "../Messages";



function  OpenChat2(props){
    //const {chatID} = props.currentID;
    const [chats, setChats] = useState([]);
    const [error, setError] = useState();
    const [chatIDNew, setChatIDNew] = useState("");

            streamChats2(props.currentID, (querySnapshot)=>{
                    const updateMessageItem = querySnapshot.docs.map(docSnapshot => docSnapshot.data());
                    setChats(updateMessageItem);
                },
                (error) =>setError("Load Message failed")
            );



    const ChatElements2 = chats.map((m,i)=><div key={i}>{m.ID1}
        <button onClick={()=> setChatIDNew(m.chatID)}>CLick</button></div>)

    return(
        <div>
            <div>{ChatElements2}</div>
            <Messages chatID={chatIDNew}/>
        </div>
    );
}

export default OpenChat2;