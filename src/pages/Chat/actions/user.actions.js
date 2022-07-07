import { userConstants } from "./constants";
import {getFirestore, query, collection, onSnapshot, where, orderBy, addDoc, serverTimestamp} from "firebase/firestore";
import firebase from "firebase/compat/app";


export const getUserListRealtime = (uid) => {

    //console.log('uid', uid)

    return async (dispatch) => {

        dispatch({ type: `${userConstants.GET_REALTIME_USERS}_REQUEST` });
        const fsDatabase = getFirestore()
        const q = query(collection(fsDatabase, "user"));
        const unsubscribe = onSnapshot(q, (querySnapshot) =>{
            const users = [];
            querySnapshot.forEach((doc)=>{
                const docUID = doc.data().userID
                if(docUID != uid){
                    users.push(doc.data());
                }
            })
            dispatch({
                type: `${userConstants.GET_REALTIME_USERS}_SUCCESS`,
                payload: { users }
            });
        })
        /*
        const unsubscribe = fsDatabase.collection("user")
        //.where("uid", "!=", uid)
        .onSnapshot((querySnapshot) => {
            const users = [];
            querySnapshot.forEach(function(doc) {
                if(doc.data().uid != uid){
                    users.push(doc.data());
                }
            });*/
            //console.log(users);



        return unsubscribe;

    }

}

export const storeMessages = (msgObj) => {
    return async dispatch => {
        const fsDatabase = getFirestore()

        await addDoc(collection(fsDatabase, "chatRooms"), {
            ...msgObj,
            isView: false,
            createdAt: serverTimestamp()
        })

        /*fsDatabase.collection('chatRooms')
        .add({
            ...msgObj,
            isView: false,
            createdAt: new Date()
        })
        .then((data) => {
            console.log(data)
            //success
            // dispatch({
            //     type: userConstants.GET_REALTIME_MESSAGES,
            // })


        })
        .catch(error => {
            console.log(error)
        });*/

    }
}

export const getRealtimeMessages = (user) => {
    return async dispatch => {
        const fsDatabase = getFirestore()
        //const messageRef =;
        const q = query( collection(fsDatabase, "chatRooms") ,where('user_uid_1', 'in', [user.uid_1, user.uid_2]) ,orderBy("createdAt","asc"));
        //fsDatabase.collection('chatRooms')

        const unsubscribe = await onSnapshot(q,(querySnapshot) => {

            const conversations = [];

            querySnapshot.forEach((doc) => {

                if(
                    (doc.data().user_uid_1 === user.uid_1 && doc.data().user_uid_2 === user.uid_2)
                    || 
                    (doc.data().user_uid_1 === user.uid_2 && doc.data().user_uid_2 === user.uid_1)
                ){
                    conversations.push(doc.data())
                }

                

                // if(conversations.length > 0){
                    
                // }else{
                //     dispatch({
                //         type: `${userConstants.GET_REALTIME_MESSAGES}_FAILURE`,
                //         payload: { conversations }
                //     })
                // }



                
            });

            dispatch({
                type: userConstants.GET_REALTIME_MESSAGES,
                payload: { conversations }
            })

            console.log(conversations);
            return unsubscribe;
        }

        )
        //user_uid_1 == 'myid' and user_uid_2 = 'yourId' OR user_uid_1 = 'yourId' and user_uid_2 = 'myId'


    }
}