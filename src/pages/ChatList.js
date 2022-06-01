import React from "react";
import {Link, Route, useNavigate} from 'react-router-dom'

//Tim Finmans
function Chat (){
    let navigate = useNavigate();

    // Hier müssen später mal die
    let messages = [new ChatOverview("Lisa", "Ich kann nicht...",  "10:44", "16.04.1999"),
        new ChatOverview("Moritz", "Komme gleich.",  "11:39", "7.04.1999"),
        new ChatOverview("Martin", "Wie gehts?",  "12:54", "6.04.1999"),
        new ChatOverview("Mira", "Na hör mal.",  "15:12", "5.04.1999"),
        new ChatOverview("Faru", "Was soll das?",  "1:43", "4.04.1999")]

    return(
        <div id="chat" className="content-box">
            <h1>Chats</h1>
            <div className="content-box-in-box" onClick={()=>navigate("/specific-chat")}>
                <img className="round-image" src="https://i.pravatar.cc/200"></img>
                <p className="user-name">Username</p>
                <p className="last-message">Am Samstag habe ich leider keine Zeit...</p>
                <p className="time-date">10:47/</p>
                <p className="time-date">15.10.2001</p>
            </div>

            {messages.map(messages=>{
                return(
                    <div className="content-box-in-box" onClick={()=>navigate("/specific-chat")}>
                        <img className="round-image" src="https://i.pravatar.cc/200"></img>
                        <p className="user-name">{messages.name}</p>
                        <p className="last-message">{messages.lastMessage}</p>
                        <p className="time-date">{messages.lastTimestemp}/</p>
                        <p className="time-date">{messages.lastDate}</p>
                    </div>
                )
            })}

        </div>
    );

}

//Tim Finmans
class ChatOverview {
    name;
    lastMessage;
    lastTimestemp;
    lastDate;

    constructor(name, lastMessage, lastTimestemp, lastDate) {
        this.name = name;
        this.lastMessage = lastMessage;
        this.lastTimestemp = lastTimestemp;
        this.lastDate = lastDate;
    }
}


/*
function AddChatOption(usernameT, lastMessageText, lastMessageTime, lastMessageDate) {
    let navigate = useNavigate();
    const element = document.getElementById("chat");
    element.innerHTML+="<div>Hello</div>"
}

function addChat(usernameT, lastMessageText, lastMessageTime, lastMessageDate) {
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
    tag.onclick()
    element.appendChild(tag);
}

/*
function Navigate() {
    let navigate = useNavigate();
    navigate("/specific-chat");
}

class ChatsList extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id="chat" className="content-box home">
                <h1>Chats</h1>
                <button onClick={()=>this.addChat("Tim","Hi","10:57", "10.05.2001")}>Color</button>
                <button onClick={()=>Navigate("/specific-chat")}>Switch</button>

                <div className="content-box-in-box">
                    <img className="round-image" src="https://i.pravatar.cc/200"></img>
                    <p className="user-name">Username</p>
                    <p className="last-message">Am Samstag habe ich leider keine Zeit...</p>
                    <p className="time-date">10:47/</p>
                    <p className="time-date">15.10.2001</p>
                    <Link to={"/specific-chat"}>Link</Link>
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
        tag.addEventListener("click", test);
        element.appendChild(tag);

        function test() {
            lastMessage.textContent = "Ja"
        }
    }
}
*/
export default Chat;