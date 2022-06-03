import React from "react";
import {Link, Route, useNavigate} from 'react-router-dom'
import context from "react-bootstrap/NavbarContext";
import {forEach} from "react-bootstrap/ElementChildren";

var selectedChat;

//Tim Finmans
function start (){
    // will be called when the chat area is entered
    return(
        <div id="whole-chat-view" className="whole-chat">
            <div className="chat-list-box">
                {newChats.map(chat=>{
                    return(
                        chat.addToViewOverview()
                    )
                })}
            </div>
            <div id="chat-box" className="specific-chat">
                <div id="to-remove-and-add"></div>
            </div>
            <div className="input-wrapper">
                <textarea id="input" className="input"></textarea>
                <button className="send-msg-btn-chat" onClick={()=>selectedChat.sendMessage(document.getElementById("input").value)}>
                    <span className="material-icons">forum</span>
                </button>
            </div>
        </div>
    );
}

//Tim Finmans
class Chat {
    name;
    lastMessage;    // will be unnecessary in the future because it can be gained by taking the arrays last element
    lastTimestamp;
    lastDate;
    messages = [];

    // constructor to fill the variables
    constructor(name, lastMessage, lastTimestemp, lastDate, messages) {
        this.name = name;
        this.lastMessage = lastMessage;
        this.lastTimestamp = lastTimestemp;
        this.lastDate = lastDate;
        messages.map(message=>{
            this.messages.push(message)
            }
        )
    }

    // add the chats that were already opened and can be chosen from the array
    addToViewOverview(){
        return (
            <div className="chat-overview" onClick={()=>this.renderChat()}>
                <img className="round-image" src="https://i.pravatar.cc/200"></img>
                <div className="text-wrapper-overview">
                    <p className="user-name">{this.name}</p>
                    <p className="last-message">{this.lastMessage}</p>
                    <p className="timestamp-overview">{this.lastDate}</p>
                </div>
            </div>
        );
    }

    // rende a specific chat when a chat was clicked
    renderChat(){
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
            if(message.type === "r"){
                containerForMessage.className = "message";
                image.className = "round-image-for-chat"
                image.src = "https://i.pravatar.cc/200"
            } else if(message.type === "s") {
                containerForMessage.className = "message sender";
                image.className = "round-image-for-chat receiver-image"
                image.src = "https://i.pravatar.cc/300"
            }

            const text = document.createElement("p");
            text.textContent = message.text;
            text.className = "message-text";

            const messageTimestamp = document.createElement("p");
            messageTimestamp.textContent = message.timestamp;
            messageTimestamp.className = "timestamp-chat";

            containerForMessage.appendChild(text);
            containerForMessage.appendChild(messageTimestamp)
            chatWindow.appendChild(image)
            chatWindow.appendChild(containerForMessage);
        })

        const whiteBar = document.createElement("div");
        whiteBar.id = "white-bar";
        whiteBar.className = "white-bar";

        const wholeChatWindow = document.getElementById("chat-box");
        wholeChatWindow.appendChild(chatWindow);
        wholeChatWindow.appendChild(whiteBar);
        wholeChatWindow.scrollTop = wholeChatWindow.scrollHeight;
    }

    sendMessage(text) {
        if(text === "") return;
        let message = new Message(text,"10:43", "s")

        // clear input
        document.getElementById("input").value = "";

        // get object to add the message to
        const addToChatWindow = document.getElementById("to-remove-and-add");

        const image = document.createElement("img")
        image.className = "round-image-for-chat receiver-image"
        image.src = "https://i.pravatar.cc/300"

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

var newMessages = [new Message("Na, wie geht es dir?", "10:40", "s"),
    new Message("Mir geht es super, danke der Nachfrage.", "10:41", "r"),
    new Message(":D", "10:44", "s"),
    new Message("Und dir?", "10:47", "r"),
    new Message("Hey", "10:40", "s"),
    new Message("Was macht die Kunst bei dir heute so an einem schönen Samstag?.", "10:41", "r"),
    new Message("Fußball schauen und Bierchen trinken.", "10:44", "s"),
    new Message("Na das wollen wir ja mal sehen was da bei raus kommt.", "10:47", "s")]

var newMessages2 = [new Message("Hey", "10:40", "s"),
    new Message("Was macht die Kunst bei dir heute so an einem schönen Samstag?.", "10:41", "r"),
    new Message("Fußball schauen und Bierchen trinken.", "10:44", "s"),
    new Message("Na das wollen wir ja mal sehen was da bei raus kommt.", "10:47", "s")]

var newChats = [new Chat("Tim","Hi wie gehts?","10.07.2001","11:25", newMessages),
    new Chat("Mennwin","Hi wie gehts dir und deiner ganze Familie?","10.07.2001","11:25", newMessages2),
    new Chat("Max","Drei Mal darfst du raten :)","10.07.2001","11:25", newMessages),
    new Chat("Katharina","Übermorgen leider erst wieder","10.07.2001","11:25", newMessages),
    new Chat("Martina","Hi wie gehts?","10.07.2001","11:25", newMessages),
    new Chat("Thomas","Naja, das muss jetzt nicht zwingend sein aber wenn du willst.","10.07.2001","11:25", newMessages),
    new Chat("Andreas","Hey","10.07.2001","11:25", newMessages),
    new Chat("Herr Winkelmann","Völlig Normal!","10.07.2001","11:25", newMessages),
    new Chat("Jason","Das kann ja wohl nicht sein?!","10.07.2001","11:25", newMessages)];

export default start;