import Picker from "emoji-picker-react";
import React, {useState} from "react";
import "firebase/compat/firestore";
import "firebase/compat/auth";

//Tim Finmans
function Start() {
    // will be called when the chat area is entered
    document.addEventListener('keypress', keyPress);

    return (
        <div id="whole-chat-view" className="whole-chat">
            <div className="chat-list-box" id="chat-list-box">
                {newChats.map(chat=>{
                    return(
                        chat.addToOverview()
                    )
                })}
            </div>
            <div id="chat-box" className="specific-chat" onClick={()=>{closeEmoji()}}>
                <div id="to-remove-and-add"></div>
                {EmojiHandling()}
            </div>
            <div className="input-wrapper">
                <textarea id="input" className="input">
                </textarea>
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

// from here to the bottom everything by Tim Finmans
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
        this.lastDate = lastDate;
        this.codeForUI = codesForUI[codesForUI.length - 1] + 1;
        codesForUI.push(codesForUI[codesForUI.length - 1] + 1);
        if(messages !== null) {
            messages.map(message=>{
                    this.messages.push(message)
                }
            )
            this.lastMessage = this.messages[(this.messages.length - 1)]
        }
    }

    // add the chats that were already opened and can be chosen from the array
    addToOverview(){
        return (
            <div id={this.codeForUI} className="chat-overview" onClick={()=>this.renderChat()}>
                <img className="round-image" src="https://i.pravatar.cc/200"></img>
                <div className="text-wrapper-overview">
                    <p className="user-name">{this.idReceiver}</p>
                    {/*<p className="last-message">{this.lastMessage.text}</p>*/}
                    <p className="timestamp-overview">{this.lastDate}</p>
                </div>
            </div>
        );
    }

    addToOverviewByID() {
        let div = document.createElement("div");
        div.id = this.codeForUI
        div.className = "chat-overview"
        div.onclick = ()=>this.renderChat()
        let img = document.createElement("img")
        img.className = "round-image"
        img.src = "https://i.pravatar.cc/200"
        let innerDiv = document.createElement("div")
        innerDiv.className = "text-wrapper-overview"
        let p1 = document.createElement("p")
        p1.className = "user-name"
        p1.textContent = this.idReceiver
        innerDiv.appendChild(p1)
        div.appendChild(img)
        div.appendChild(innerDiv)

        return div
    }

    // render a specific chat when a chat was clicked
    renderChat(){
        //close emoji Selection
        closeEmoji()

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
        const textField = document.getElementById("input")
        textField.textContent = ""

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

// Tim Finmans
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
        textField.value = textField.value + emojiObject.emoji
        event.stopPropagation();
    };

    return (
        <div className="emoji-picker-wrapper" id="picker-wrapper">
            <Picker onEmojiClick={onEmojiClick}/>
        </div>
    );
};

function closeEmoji(event) {
    if(document.getElementById("picker-wrapper").style.visibility === "visible") {
        document.getElementById("picker-wrapper").style.visibility = "hidden";
    }
}

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