import React from "react";

function CreateChat() {
    return (
        <div id="specific-chat" className="chat-box">
            <img className="round-image-for-specific-chat" src="https://i.pravatar.cc/200"></img>
            <p className="person-name">Name of the person</p>
            <div className="line"></div>
            <div className="placeholder-chat"></div>
            <button onClick={()=>receiverMessage("Message is much muhc longer")}>Receiver</button>
            <button onClick={()=>senderMessage("Message is much muhc longer")}>Sender</button>
        </div>
    );
}

function receiverMessage(messageText) {
    const tag = document.createElement("div");
    tag.className = "receiver";

    const message = document.createElement("p");
    message.textContent = messageText;
    message.className = "user-name";

    const element = document.getElementById("specific-chat");
    tag.appendChild(message);
    element.appendChild(tag);
}


function senderMessage(messageText) {
    const tag = document.createElement("div");
    tag.className = "sender";

    const message = document.createElement("p");
    message.textContent = messageText;
    message.className = "user-name";

    const element = document.getElementById("specific-chat");
    tag.appendChild(message);
    element.appendChild(tag);
}

class Chats extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {
        return (
            <div id="chat" className="content-box home">
                <h1>Chats</h1>
                <button onClick={()=>this.addChat("Tim","Hi","10:57", "10.05.2001")}>Color</button>
                <div className="content-box-in-box">
                    <img className="round-image" src="https://i.pravatar.cc/200"></img>
                    <p className="user-name">Username</p>
                    <p className="last-message">Am Samstag habe ich leider keine Zeit...</p>
                    <p className="time-date">10:47/</p>
                    <p className="time-date">15.10.2001</p>
                </div>
            </div>
        );
    }
}


export default CreateChat;