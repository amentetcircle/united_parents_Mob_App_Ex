import React from "react";
import Data from "bootstrap/js/src/dom/data";

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

export default Chats;