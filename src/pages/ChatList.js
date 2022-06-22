import React, {useState} from "react";
import EmojiPicker from "emoji-picker-react";
import Picker from 'emoji-picker-react';
import React, {useEffect, useState} from "react";
import {Link, Route, useNavigate} from 'react-router-dom'
import "firebase/compat/firestore";
import "firebase/compat/auth";
import  {fsDatabase, auth, adminAuth} from "../Firebase";
import {collection, query, where, getDocs, addDoc, doc, getDoc, setDoc, onSnapshot} from "firebase/firestore";
import {useCollectionData} from "react-firebase-hooks/firestore";
import {forEach} from "react-bootstrap/ElementChildren";
import firebase from "firebase/compat/app";



/*export const streamMessages = (chatID, snapshot, error) =>{
    const messagesRefNew = collection(fsDatabase, "messages");
    const qMes = query(messagesRefNew, where("chatID", "==", chatID));
    return onSnapshot(qMes, snapshot, error)
}*/




//Tim Finmans
function Start() {
    // will be called when the chat area is entered
    document.addEventListener('keypress', keyPress);

    //Maximilian Fay Not fully functional part
   /*
    const [newMessage, setNewMessage] = useState("");
    const [chatIDGlob, setChatIDGlob] = useState("");
    //fetch chats
    const chatsRef = collection(fsDatabase, "chats");
    const q1 = query(chatsRef, where("ID1", "==", auth.currentUser.uid))
    const messagesRef = collection(fsDatabase, "messages");
    /*const unsubscribe = onSnapshot(q1,(querySnapshot) =>{
        newChats.pop();
        querySnapshot.forEach((doc)=>{
            newChats.push(new Chat("ID2", doc.data().ID2, "Hey", "01.01.2001", "01.01.2000", null));
        })
    });
    const [m1] = useCollectionData(q1, {uid: "id"});
    const q2 = query(chatsRef, where("ID2", "==",auth.currentUser.uid));
    const [m2] = useCollectionData(q2, {uid: "id"});

   /* async function LoadingChats() {

        const querySnapshot1 = await getDocs(q1);
        newChats = [];
        querySnapshot1.forEach((doc) => {
            const newMessageArray = OpenChat(doc.data().chatID);
            newChats.push(new Chat("ID2", doc.data().ID2, "Hey", "01.01.2001", "01.01.2000", newMessageArray));

        })
        const querySnapshot2 = await getDocs(q2);

        querySnapshot2.forEach((doc) => {
            const newMessageArray = OpenChat(doc.data().chatID);
            newChats.push(new Chat("ID1", doc.data().ID1, "Hey", "01.01.2001", "01.01.2000", newMessageArray))

        })
    }



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

    function ChatMessage(props) {
        //get porperties from current document
        const {text, sender_uid} = props.message;
        //check if message from current User
        const messageTyp = sender_uid === auth.currentUser.uid ? "sent" : "received";

        // const element = document.getElementById("messageInput");
        // element.scrollIntoView()
        window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "auto" });    // scrolls down when a new message is added but not when the chat ist loaded. Don't know why at the moment

        if(messageTyp === "sent") {  //{createdAt.toString()}
            return (
                <div className="message sender">
                    <p className="message-text">
                        {text} , {messageTyp}, {sender_uid}
                    </p>
                    <p className="timestemp-chat">
                        18
                    </p>
                </div>
            );
        } else if(messageTyp === "received") {   //{createdAt.toString()}
            return (
                <div className="message">
                    <p className="message-text">
                        {text} , {messageTyp}, {sender_uid}
                    </p>
                    <p className="timestemp-chat">
                        18
                    </p>
                </div>
            );
            {mMes && mMes.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
        }
    }



        //chatIDMes = useCollectionData(query(collection(fsDatabase, "messages"),where("chatID", "==", chatID)))

        //qMes = query(messagesRef, where("chatID", "==", chatID));
        //const [mMes] = useCollectionData(qMes, {uid: "id"});

        const snapshot = await getDocs(qMes);
        snapshot.forEach((doc) => {
            const messageTyp = doc.data().sender_uid === auth.currentUser.uid ? 's' : 'r';

            newMessages.push(new Message(doc.data().text,"doc.data().createdAt.toString()", messageTyp));

        })
        return newMessages


    function GetChatsID(props){

        const {ID2, chatID} = props.message;
        //chatIDMes = chatID
        //newChats.push(new Chat("ID2", chatID, "Hey","01.01.2001","01.01.2000", newMessages))
        //setChatIDGlob(chatID);
        return(

            <li>
                <h1>
                    {ID2}
                </h1>
                <button className="send-msg-btn" onClick={setID(chatID)}>
                    <span className="material-icons">forum</span>
                </button>

                <OpenChat{...{chatID}}></OpenChat>
            </li>

        );

    }

    function GetChatsID2(props) {
        const {ID1, chatID} = props.message;
        //chatIDMes = chatID
        return(

            <li>
                <h1>
                    {ID1}
                </h1>
                <button className="send-msg-btn">
                    <span className="material-icons">forum</span>
                </button>

            </li>

        );
    }

    function OpenChat(props) {
        const {chatID} = props;
        const [messages, setMessages] = useState([]);
        const [error, setError] = useState();

        useEffect(() => {
                const unsubscribe = streamMessages(chatID, (querySnapshot) => {
                        const updateMessageItem = querySnapshot.docs.map(docSnapshot => docSnapshot.data());
                        setMessages(updateMessageItem);
                    },
                    (error) => setError('Load Messages failed')
                );
                return unsubscribe;
            }, [chatID, setMessages]
        );

        const MessageElements = messages.map((m, i) => <div key={i}>{m.text}</div>)

        return (
            <div>
                <di>{MessageElements}</di>
            </div>
        );
    }

    function ShowChat(props) {
        const newChat = props;
        return(
            <div>
                <OpenChat{...{newChat}}></OpenChat>
            </div>

        )
    }

    {m1 && m1.map(chat => <GetChatsID key={chat.id} message={chat}/>)}
            {m2 && m2.map(chat => <GetChatsID key={chat.id} message={chat}/>)}
            <textarea className="input" id="input" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}/>
            <button className="send-msg-btn" onClick={sendMessage}>
                <span className="material-icons">forum</span>
            </button>
    */
//Maximilian Fay Not fully functional

    return (

        <div id="whole-chat-view" className="whole-chat">
            <div className="chat-list-box" id="chat-list-box">
                {newChats.map(chat=>{
                    return(
                        chat.addToOverview()
                    )
                })}
            </div>
            <div id="chat-box" className="specific-chat">
                <div id="to-remove-and-add"></div>
                {EmojiHandling()}
            </div>
            <div className="input-wrapper">
                <textarea id="input" className="input"></textarea>
                <button className="send-msg-btn-chat" onClick={()=>selectedChat.sendMessage(document.getElementById("input").value)}>
                    <span className="material-icons">forum</span>
                </button>
                <button className="send-msg-btn-chat open-emoji" onClick={()=>(document.getElementById("picker-wrapper").style.visibility === "visible") ? document.getElementById("picker-wrapper").style.visibility="hidden" : document.getElementById("picker-wrapper").style.visibility="visible"}>😄</button>
            </div>
            <button onClick={()=>(newChats[0].addNotification())}>CLK</button>
            <button onClick={()=>(newChats[1].addNotification())}>CLK</button>
            <button onClick={()=>(newChats[5].addNotification())}>CLK</button>
            <button onClick={()=>(newChats[6].addNotification())}>CLK</button>
        </div>
    );
}

var codesForUI = [1];

//Tim Finmans
class Chat {
    idReceiver;
    name;
    lastMessage;    // will be unnecessary in the future because it can be gained by taking the arrays last element Test
    lastDate;
    messages = [];
    codeForUI;

    // constructor to fill the variables
    constructor(idReceiver, name, lastMessage, lastDate, messages) {
        this.idReceiver = idReceiver;
        this.name = name;
        this.lastMessage = lastMessage;
        this.lastTimestamp = lastTimestemp;
        this.lastDate = lastDate;
        this.codeForUI = codesForUI[codesForUI.length - 1] + 1;
        codesForUI.push(codesForUI[codesForUI.length - 1] + 1);
        messages.map(message=>{
            this.messages.push(message)
            }
        )
        this.lastMessage = this.messages[(this.messages.length - 1)]
    }

    // add the chats that were already opened and can be chosen from the array
    addToOverview(){
        return (
            <div id={this.codeForUI} className="chat-overview" onClick={()=>this.renderChat()}>
                <img className="round-image" src="https://i.pravatar.cc/200"></img>
                <div className="text-wrapper-overview">
                    <p className="user-name">{this.name}</p>
                    <p className="last-message">{this.lastMessage.text}</p>
                    <p className="timestamp-overview">{this.lastDate}</p>
                </div>
            </div>
        );
    }

    // render a specific chat when a chat was clicked
    renderChat(){
        //remove the notification
        if(document.getElementById(this.codeForUI + "-notification") !== null) {
            document.getElementById(this.codeForUI + "-notification").remove();
        }
        // high lite this chat and un high light the previous one, if the previous one isn't this one
        if(selectedChat !== null && selectedChat !== this){
            document.getElementById(selectedChat.codeForUI).style.backgroundColor = '#82C0CC';
        }
        document.getElementById(this.codeForUI).style.backgroundColor = '#cccccc';

        // set the selected chat to this one
        selectedChat = this;

        //delete the chat that is displayed at the moment
        const deleteChatWindow = document.getElementById("to-remove-and-add");
        deleteChatWindow.remove();

        // create it again, set it to the same id
        const chatWindow = document.createElement("div");
        chatWindow.id = "to-remove-and-add";
        chatWindow.className = "to-remove-and-add"

        // loop through the messages and add them to the overview
        this.messages.map(message=>{
            const image = document.createElement("img")
            const containerForMessage = document.createElement("div");

            // add the style depending on the message type
            if(message.type === "r"){
                containerForMessage.className = "message";
                image.className = "round-image-for-chat"
                image.src = "https://i.pravatar.cc/200"
            } else if(message.type === "s") {
                containerForMessage.className = "message sender";
                image.className = "round-image-for-chat receiver-image"
                image.src = "https://i.pravatar.cc/300"
            }

            //create text
            const text = document.createElement("p");
            text.textContent = message.text;
            text.className = "message-text";

            //create timestamp
            const messageTimestamp = document.createElement("p");
            messageTimestamp.textContent = message.timestamp;
            messageTimestamp.className = "timestamp-chat";

            //add timestamp and text to the container
            containerForMessage.appendChild(text);
            containerForMessage.appendChild(messageTimestamp)

            //add the image and the message to the container which contains all the messages
            chatWindow.appendChild(image)
            chatWindow.appendChild(containerForMessage);
        })

        //remove white bar
        if(document.getElementById("white-bar"))document.getElementById("white-bar").remove();

        //create a white bar which will prevent the chat from being displayed directly at the chat containers border
        const whiteBar = document.createElement("div");
        whiteBar.id = "white-bar";
        whiteBar.className = "white-bar";


        // get the whole window and add the messages, white bar | scroll to the bottom of the container
        const wholeChatWindow = document.getElementById("chat-box");
        wholeChatWindow.appendChild(chatWindow);
        wholeChatWindow.appendChild(whiteBar);
        wholeChatWindow.scrollTop = wholeChatWindow.scrollHeight;

        // should also check if the textBox is already focused but doesn't do it
        if(document.getElementById("input") !== document.activeElement) document.getElementById("input").focus()
    }

    sendMessage(text) {
        // return when the text ist empty
        if(text === "") return;

        // swap chats when the selected chat isn't already at the first place
        if(newChats[0] !== selectedChat){
            // delete this Element from the overview
            let thisOverview = document.getElementById(this.codeForUI)
            document.getElementById(this.codeForUI).remove()

            // insert it in front of the first element of the view
            let toAddTo = document.getElementById("chat-list-box")
            toAddTo.insertBefore(thisOverview, document.getElementById(newChats[0].codeForUI))
        }

        // sort the array => pull the chat that "wrote" a message on top
        let thisElement = newChats[newChats.indexOf(this)]  // save the element
        newChats.splice(newChats.indexOf(this), 1)  // delete it from the current place
        newChats.splice(0, 0, thisElement)  // put it on top

        let message = new Message(text,"10:43", "s")    // timestamp has to be added

        // clear input
        document.getElementById("input").value = "";

        // get object to add the message to
        const addToChatWindow = document.getElementById("to-remove-and-add");

        // create image
        const image = document.createElement("img")
        image.className = "round-image-for-chat receiver-image"
        image.src = "https://i.pravatar.cc/300"

        // create container for timestamp and text => create text and timestamp
        const containerForMessage = document.createElement("div");
        containerForMessage.className = "message sender";

        const textContainer = document.createElement("p");
        textContainer.textContent = message.text;
        textContainer.className = "message-text";

        const messageTimestamp = document.createElement("p");
        messageTimestamp.textContent = message.timestamp;
        messageTimestamp.className = "timestamp-chat";

        containerForMessage.appendChild(textContainer);
        containerForMessage.appendChild(messageTimestamp);

        // remove white bar to add it later on again
        const removeWhiteBar = document.getElementById("white-bar");
        removeWhiteBar.remove()

        const whiteBar = document.createElement("div");
        whiteBar.id = "white-bar";
        whiteBar.className = "white-bar";

        addToChatWindow.appendChild(image)
        addToChatWindow.appendChild(containerForMessage);

        const wholeChatWindow = document.getElementById("chat-box");
        wholeChatWindow.appendChild(whiteBar);
        wholeChatWindow.scrollTop = wholeChatWindow.scrollHeight;

        // scroll to the top of the chat overview when the message was send and the overview was moved to the top
        document.getElementById("picker-wrapper").style.visibility="hidden"
        document.getElementById("chat-list-box").scrollTop = 0;
    }

    receivedMessage() {
        this.addNotification();
    }

    addNotification() {
        // add nothing when the chat to be added is the selected chat
        if(selectedChat === this) return;

        if(document.getElementById(this.codeForUI + "-notification") !== null) {
            let existingNotification = document.getElementById(this.codeForUI + "-notification")
            if(parseInt(existingNotification.textContent) > 98){
                existingNotification.textContent = "99+";
            }
            else {
                existingNotification.textContent = (parseInt(existingNotification.textContent) + 1).toString();
            }
            return;
        }
        let notification = document.createElement("div");
        notification.className = "notification"
        notification.id = this.codeForUI + "-notification"
        notification.textContent = "1";

        let overview = document.getElementById(this.codeForUI);
        overview.appendChild(notification)
    }
}

// function for handling enter in the textarea
function keyPress(evt) {
    if (evt.keyCode === 13 && evt.shiftKey) {
        if (evt.type === "keypress") {
            selectedChat.sendMessage(document.getElementById("input").value)
            document.getElementById("picker-wrapper").style.visibility="hidden"
        }
        evt.preventDefault();
    }
    if(evt.keyCode === 13) {

    }
}

class Message {
    text;
    timestamp;
    type;   // r = received, s = send

    constructor(text, timestamp, type) {
        this.text = text;
        this.timestamp = timestamp;
        this.type = type;
    }

    // not used at the moment because the messages need to be added to an Element via the ID
    addToView() {
        if(this.type === 's'){
            return(
                <div className="message sender">
                    <p className="message-text">
                        {this.text}
                    </p>
                    <p className="timestamp-chat">
                        {this.timestamp}
                    </p>
                </div>
            )
        } else if(this.type === 'r') {
            return (
                <div className="message">
                    <p className="message-text">
                        {this.text}
                    </p>
                    <p className="timestamp-chat">
                        {this.timestamp}
                    </p>
                </div>
            );
        }
    }
}

// inspired by https://www.npmjs.com/package/emoji-picker-react
const EmojiHandling = () => {
    const [chosenEmoji, setChosenEmoji] = useState(null);

    const onEmojiClick = (event, emojiObject) => {
        setChosenEmoji(emojiObject);
        const textField = document.getElementById("input")
        textField.textContent = textField.textContent + emojiObject.emoji
    };

    return (
        <div className="emoji-picker-wrapper" id="picker-wrapper">
            <Picker onEmojiClick={onEmojiClick}/>
        </div>
    );
};

var newMessages = [new Message("Na, wie geht es dir?", "10:40", "s"),
    new Message("Mir geht es super, danke der Nachfrage.", "10:41", "r"),
    new Message(":D", "10:44", "s"),
    new Message("Und dir?", "10:47", "r"),new Message("Hey", "10:40", "s"),
    new Message("Was machts du?", "10:41", "r"),
    new Message("Nichts besonderes.", "10:44", "s"),
    new Message("Okay. Aber das wird noch anders, oder?!", "10:47", "s")]

var newMessages2 = [new Message("Und dir?", "10:47", "r"),new Message("Hey", "10:40", "s"),
    new Message("Was machts du?", "10:41", "r"),
    new Message("Nichts besonderes.", "10:44", "s"),
    new Message("Okay.", "10:47", "s")]

var newChats = [new Chat("UID1","Tim","Hi wie gehts?","11:25", newMessages),
    new Chat("UID2","Luisa","Hi wie gehts dir und deiner ganze Familie?","11:25", newMessages2),
    new Chat("UID3","Max","Drei Mal darfst du raten :)","11:25", newMessages),
    new Chat("UID4","Katharina","Übermorgen leider erst wieder","11:25", newMessages),
    new Chat("UID5","Martina","Hi wie gehts?","11:25", newMessages),
    new Chat("UID6","Thomas","Naja, das muss jetzt nicht zwingend sein aber wenn du willst.","11:25", newMessages),
    new Chat("UID7","Andreas","Hey","10.07.2001", newMessages),
    new Chat("UID8","Herr Winkelmann","Völlig Normal!","11:25", newMessages),
    new Chat("UID9","Jason","Das kann ja wohl nicht sein?!","11:25", newMessages)];


// store the selected chat
var selectedChat = null;

export default Start;