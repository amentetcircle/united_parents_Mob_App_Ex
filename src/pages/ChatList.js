import React from "react";

//Tim Finmans
function start (){
    // will be called when the chat area is entered
    document.addEventListener('keypress', keyPress);

    return(
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
            </div>
            <div className="input-wrapper">
                <textarea id="input" className="input"></textarea>
                <button className="send-msg-btn-chat" >
                    <span className="material-icons">forum</span>
                </button>
                <button onClick={()=>newChats[1].addNotification()}>click</button>
            </div>
        </div>
    );
}

//Tim Finmans
class Chat {
    idReceiver;
    name;
    lastMessage;    // will be unnecessary in the future because it can be gained by taking the arrays last element
    lastTimestamp;
    lastDate;
    messages = [];

    // constructor to fill the variables
    constructor(idReceiver, name, lastMessage, lastTimestemp, lastDate, messages) {
        this.idReceiver = idReceiver;
        this.name = name;
        this.lastMessage = lastMessage;
        this.lastTimestamp = lastTimestemp;
        this.lastDate = lastDate;
        messages.map(message=>{
            this.messages.push(message)
            }
        )
        this.lastMessage = this.messages[(this.messages.length - 1)]
    }

    // add the chats that were already opened and can be chosen from the array
    addToOverview(){
        return (
            <div id={this.idReceiver} className="chat-overview" onClick={()=>this.renderChat()}>
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
        if(document.getElementById(this.idReceiver + "-notification") !== null) document.getElementById(this.idReceiver + "-notification").remove();

        // high lite this chat and un high light the previous one, if the previous one isn't this one
        if(selectedChat !== null && selectedChat !== this) document.getElementById(selectedChat.idReceiver).style.backgroundColor = '#82C0CC';
        document.getElementById(this.idReceiver).style.backgroundColor = '#cccccc';

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
            let thisOverview = document.getElementById(this.idReceiver)
            document.getElementById(this.idReceiver).remove()

            // insert it in front of the first element of the view
            let toAddTo = document.getElementById("chat-list-box")
            toAddTo.insertBefore(thisOverview, document.getElementById(newChats[0].idReceiver))
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
        document.getElementById("chat-list-box").scrollTop = 0;
    }

    receivedMessage() {
        this.addNotification();
    }

    addNotification() {
        // add nothing when the chat to be added is the selected chat
        if(selectedChat === this) return;

        if(document.getElementById(this.idReceiver + "-notification") !== null) {
            let existingNotification = document.getElementById(this.idReceiver + "-notification")
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
        notification.id = this.idReceiver + "-notification"
        notification.textContent = "1";

        let overview = document.getElementById(this.idReceiver);
        overview.appendChild(notification)
    }
}

// function for handling enter in the textarea
function keyPress(evt) {
    if (evt.keyCode === 13 && evt.shiftKey) {
        if (evt.type === "keypress") {
            selectedChat.sendMessage(document.getElementById("input").value)
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

var newChats = [new Chat("UID1","Tim","Hi wie gehts?","10.07.2001","11:25", newMessages),
    new Chat("UID2","Mennwin Oh man Oh men oh ah uh men","Hi wie gehts dir und deiner ganze Familie?","10.07.2001","11:25", newMessages2),
    new Chat("UID3","Max","Drei Mal darfst du raten :)","10.07.2001","11:25", newMessages),
    new Chat("UID4","Katharina","Übermorgen leider erst wieder","10.07.2001","11:25", newMessages),
    new Chat("UID5","Martina","Hi wie gehts?","10.07.2001","11:25", newMessages),
    new Chat("UID6","Thomas","Naja, das muss jetzt nicht zwingend sein aber wenn du willst.","10.07.2001","11:25", newMessages),
    new Chat("UID7","Andreas","Hey","10.07.2001","11:25", newMessages),
    new Chat("UID8","Herr Winkelmann","Völlig Normal!","10.07.2001","11:25", newMessages),
    new Chat("UID9","Jason","Das kann ja wohl nicht sein?!","10.07.2001","11:25", newMessages)];


// store the selected chat
var selectedChat = null;

export default start;