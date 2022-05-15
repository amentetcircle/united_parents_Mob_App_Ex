import React from "react";
import Data from "bootstrap/js/src/dom/data";

class ChatsList extends React.Component {
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
    addChat(usernameT, lastMessageText, lastMessageTime, lastMessageDate) {
        const tag = document.createElement("div");
        tag.className = "content-box-in-box";

        const image = document.createElement("img");
        image.src = "https://i.pravatar.cc/200";
        image.className = "round-image";

        const username = document.createElement("p");
        username.textContent = usernameT;
        username.className = "user-name";

        const lastMessage = document.createElement("p");
        lastMessage.textContent = lastMessageText;
        lastMessage.className = "last-message";

        const time = document.createElement("p");
        time.textContent = lastMessageTime + "/";
        time.className = "time-date";

        const date = document.createElement("p");
        date.textContent = lastMessageDate;
        date.className = "time-date";

        const element = document.getElementById("chat");
        tag.appendChild(image);
        tag.appendChild(username);
        tag.appendChild(lastMessage);
        tag.appendChild(time);
        tag.appendChild(date);
        element.appendChild(tag);
    }
}

export default ChatsList;