import {collection, onSnapshot, query, where} from "firebase/firestore";
import {fsDatabase} from "../../../../Firebase";

export const streamChats1 = (currentID,snapshot, error) => {
    const chatsRef = collection(fsDatabase, "chats");
    const q1 = query(chatsRef, where("ID1", "==", currentID))
    return onSnapshot(q1, snapshot, error)
}

export const streamChats2 = (currentID, snapshot, error) => {
    const chatsRef = collection(fsDatabase, "chats");
    const q2 = query(chatsRef, where("ID2", "==",currentID));
    return onSnapshot(q2, snapshot, error)
}