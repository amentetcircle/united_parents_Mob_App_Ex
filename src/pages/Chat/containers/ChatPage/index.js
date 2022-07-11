import React, {useEffect, useRef, useState} from 'react';
import './style.css';
import Layout from '../../components/Layout';
import { useDispatch, useSelector } from 'react-redux';
import {getRealtimeMessages, getUserListRealtime, storeMessages} from '../../actions';
import Picker from "emoji-picker-react";
import {getMessage} from "@testing-library/jest-dom/dist/utils";
import ReactScrollableFeed from "react-scrollable-feed";

const User = (props) => {

    const {user, onClick} = props;

    return (
        <div className="chat-overview" onClick={()=> onClick(user)}>
            <img className="round-image" src="https://i.pravatar.cc/200"></img>
            <div className="text-wrapper-overview">
                <p className="user-name">{user.displayName}</p>
                {/*<p className="last-message">{this.lastMessage.text}</p>*/}
                <p className="timestamp-overview">10:52</p>
            </div>
            <span className={user.isOnline ? `onlineStatus` : `onlineStatus off`}></span>
        </div>
    );
}

const ChatPage = (props) => {

    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);
    const user = useSelector(state => state.user);
    const [chatStarted, setChatStarted] = useState(false);
    const [chatUser, setChatUser] = useState('');
    const [message, setMessage] = useState('');
    const [userUid, setUserUid] = useState(null);
    let previousChat = null;
    let unsubscribe;
    const dummy = useRef(null);

    useEffect(() => {

        unsubscribe = dispatch(getUserListRealtime(auth.uid))
            .then(unsubscribe => {
                return unsubscribe;
            })
            .catch(error => {
                console.log(error);
            })




    }, []);


    //componentWillUnmount
    useEffect(() => {
        return () => {

            unsubscribe.then(f => f()).catch(error => console.log(error));

        }
    }, []);


    const initChat = (user) => {
        dummy.current?.scrollIntoView({behavior: "smooth"})
        setChatStarted(true)
        setChatUser(`${user.firstName} ${user.lastName}`)
        setUserUid(user.userID);

        console.log(user);

        dispatch(getRealtimeMessages({ uid_1: auth.uid, uid_2: user.userID }));

    }

    const submitMessage = (e) => {
        e.preventDefault();
        const msgObj = {
            user_uid_1: auth.uid,
            user_uid_2: userUid,
            message
        }


        if(message !== ""){
            dispatch(storeMessages(msgObj))
                .then(() => {
                    setMessage('')
                });

        }
        //dummy.current?.scrollIntoView({behavior: "smooth"})
        //document.getElementById("input").value = ""

    }

    // inspired by https://www.npmjs.com/package/emoji-picker-react
    const EmojiHandling = () => {
        const [chosenEmoji, setChosenEmoji] = useState(null);

        const onEmojiClick = (event, emojiObject) => {
            setChosenEmoji(emojiObject);
            const textField = document.getElementById("input")
            textField.value = textField.value + emojiObject.emoji
            event.stopPropagation();
            setMessage(textField.value)
        };

        return (
            <div className="emoji-picker-wrapper" id="picker-wrapper">
                <Picker onEmojiClick={onEmojiClick}/>
            </div>
        );
    };



    return (
        <Layout>
        <div className="whole-chat">
            <div className="chat-list-box">
                {
                    user.users.length > 0 ?
                        user.users.map(user => {
                            return (
                                <User
                                    onClick={initChat}
                                    key={user.userID}
                                    user={user}
                                />
                            );
                        }) : null
                }
            </div>
            <div className="specific-chat" id="chat-box" onClick={()=>{closeEmoji()}}>
                {EmojiHandling()}
                <div className="to-remove-and-add">

                    {
                        chatStarted ?
                            user.conversations.map(con => <div>
                                <img className={con.user_uid_1 === auth.uid ? "round-image-for-chat receiver-image" : "round-image-for-chat"} src="https://i.pravatar.cc/200"></img>
                                <div className={con.user_uid_1 === auth.uid ? "message sender" : "message" }>
                                    <p className="message-text" >{con.message}</p>
                                    <p className="timestamp-chat">{new Intl.DateTimeFormat('en-US', {year: 'numeric', month: '2-digit',day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}).format(con.createdAt)}</p>

                                </div>
                            </div>)

                            : null
                    }

                </div>

                <div className="white-bar"></div>
            </div>
            <div className="input-wrapper">
                        <textarea id="input"
                                  className="input"
                                  onChange={(e) => setMessage(e.target.value)}
                                  placeholder="Write Message">
                        </textarea>
                <button className="send-msg-btn-chat" onClick={submitMessage}>
                    <span className="material-icons">forum</span>
                </button>
                <button className="send-msg-btn-chat open-emoji" onClick={()=>(document.getElementById("picker-wrapper").style.visibility === "visible") ? document.getElementById("picker-wrapper").style.visibility="hidden" : document.getElementById("picker-wrapper").style.visibility="visible"}>😄</button>
            </div>
        </div>
        </Layout>
    );
}

function closeEmoji(event) {
    if(document.getElementById("picker-wrapper").style.visibility === "visible") {
        document.getElementById("picker-wrapper").style.visibility = "hidden";
    }
}

export default ChatPage;