import React, {useEffect, useState} from "react";
import "firebase/compat/firestore";
import "firebase/compat/auth";

import {collection, query, where, getDocs, addDoc, doc, getDoc, setDoc, onSnapshot} from "firebase/firestore";
import firebase from "firebase/compat/app";
import  {fsDatabase, auth, adminAuth} from "./../../Firebase";
import OpenChat2 from "./OpenChat/OpenChat2";
import OpenChat1 from "./OpenChat/OpenChat1";


function ChatRooms(){

    const currentID = auth.currentUser.uid

    return(
        <div>
            <OpenChat1 currentID={currentID}/>
            <OpenChat2 currentID={currentID}/>
        </div>

        );
}

export default ChatRooms;