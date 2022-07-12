import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { authConstanst } from './constants';
import { getUserListRealtime } from './user.actions';

import {getFirestore, setDoc, getDoc, doc, updateDoc} from "firebase/firestore";
import { getAuth, updateProfile, onAuthStateChanged } from 'firebase/auth';
import {auth} from "../../../Firebase";
//import {useNavigate} from "react-router-dom";
import {createUserDocument} from "../../../context/UserAuthContext";

export const signup = (user) => {

    return async (dispatch) => {

        dispatch({type: `${authConstanst.USER_LOGIN}_REQUEST`});


        const loggedInUser = {
            displayName: user.displayName,
            uid: auth.currentUser.uid,
            email: user.email
        }
        dispatch({
            type: `${authConstanst.USER_LOGIN}_SUCCESS`,
            payload: {user: loggedInUser}
        })





    }


}

export const signin = (user) => {
    return async dispatch => {

        dispatch({ type: `${authConstanst.USER_LOGIN}_REQUEST` });
        const fsDatabase = getFirestore()

               // onAuthStateChanged(auth, async (user) => {
                    const uid = user.uid;
                    const docRef = doc(fsDatabase, "user", uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const displayName = docSnap.data().displayName;

                        const loggedInUser = {
                            displayName: displayName,
                            uid: uid,
                            email: user.email
                        }

                        dispatch({
                            type: `${authConstanst.USER_LOGIN}_SUCCESS`,
                            payload: {user: loggedInUser}
                        });

                    }
        


    }
}


export const logout = (uid) => {
    return async dispatch => {
        dispatch({ type: `${authConstanst.USER_LOGOUT}_REQUEST` });
        //Now lets logout user
        const fsDatabase = getFirestore()
        const userRef = doc(fsDatabase, "user", auth.currentUser.uid);

        await updateDoc(userRef,{
            isOnline: false
        });


    }
}

