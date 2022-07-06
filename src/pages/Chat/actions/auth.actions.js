import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { authConstanst } from './constants';
import { getRealtimeUsers } from './user.actions';

import {getFirestore, setDoc, getDoc, doc, updateDoc} from "firebase/firestore";
import { getAuth, updateProfile, onAuthStateChanged } from 'firebase/auth';
import {auth} from "../../../Firebase";
import {useNavigate} from "react-router-dom";

export const signup = (user) => {

    return async (dispatch) => {

        const fsDatabase = getFirestore();

        dispatch({type: `${authConstanst.USER_LOGIN}_REQUEST`});

        await createUserWithEmailAndPassword(auth, user.email, user.password)
        /*.then(data => {
            console.log(data);
            const currentUser = auth.currentUser;
            const name = `${user.firstName} ${user.lastName}`;
            currentUser.updateProfile({
                displayName: name
            })
            .then((data) => {
                //if you are here means it is updated successfully
                fsDatabase.collection('user')
                .doc(data.user.uid)
                .set({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    uid: data.user.uid,
                    createdAt: new Date(),
                    isOnline: true
                })*/
        const name = `${user.firstName} ${user.lastName}`;

        await updateProfile(auth.currentUser, {
            displayName: name
        })

        const docData = {
            firstName: user.firstName,
            lastName: user.lastName,
            uid: auth.currentUser.uid,
            createdAt: new Date(),
            isOnline: true,
            displayName: name
        }
         await setDoc(doc(fsDatabase, "user", auth.currentUser.uid), docData)
        const loggedInUser = {
            firstName: user.firstName,
            lastName: user.lastName,
            uid: auth.currentUser.uid,
            email: user.email
        }
        dispatch({
            type: `${authConstanst.USER_LOGIN}_SUCCESS`,
            payload: {user: loggedInUser}
        })


            /*.then(() => {
                //succeful

                localStorage.setItem('user', JSON.stringify(loggedInUser));
                console.log('User logged in successfully...!');
                dispatch({
                    type: `${authConstanst.USER_LOGIN}_SUCCESS`,
                    payload: {user: loggedInUser}
                })
            })
            .catch(error => {
                console.log(error);
                dispatch({
                    type: `${authConstanst.USER_LOGIN}_FAILURE`,
                    payload: {error}
                });
            })

        //})
        .catch(error => {
            console.log(error);
        })*/


    }


}

export const signin = (user) => {
    return async dispatch => {

        dispatch({ type: `${authConstanst.USER_LOGIN}_REQUEST` });
        const fsDatabase = getFirestore()
        /*const userRef = doc(fsDatabase, "user", auth.currentUser.uid);
        const tmp = auth.currentUser.uid;
        const test=0;

        await updateDoc(userRef,{
            isOnline: true
        });*/
        //await signInWithEmailAndPassword(auth, user.email, user.password)

        const userRef = doc(fsDatabase, "user", auth.currentUser.uid);
        const tmp = auth.currentUser.uid;
        const test=0;

        await updateDoc(userRef,{
            isOnline: true
        });

                onAuthStateChanged(auth, async (user) => {
                    const uid = user.uid;
                    const docRef = doc(fsDatabase, "user", uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const name = docSnap.data().displayName.split(" ") //split(" ");
                        const firstName = name[0];
                        const lastName = name[1];
                        const loggedInUser = {
                            firstName,
                            lastName,
                            uid: uid,
                            email: user.email
                        }

                        dispatch({
                            type: `${authConstanst.USER_LOGIN}_SUCCESS`,
                            payload: {user: loggedInUser}
                        });

                    }

                })






        /*.then((data) => {
            console.log(data);


            fsDatabase.collection('user')
            .doc(data.user.uid)
            .update({
                isOnline: true
            })
            .then(() => {




                //localStorage.setItem('user', JSON.stringify(loggedInUser));




            



        /*})
        .catch(error => {
            console.log(error);
            dispatch({
                type: `${authConstanst.USER_LOGIN}_FAILURE`,
                payload: { error }
            })
        })*/
        


    }
}

export const isLoggedInUser = () => {
    return async dispatch => {

        const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

        if(user){
            dispatch({
                type: `${authConstanst.USER_LOGIN}_SUCCESS`,
                payload: { user }
            });
        }else{
            dispatch({
                type: `${authConstanst.USER_LOGIN}_FAILURE`,
                payload: { error: 'Login again please' }
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
        /*

        fsDatabase.collection('user')
        .doc(uid)
        .update({
            isOnline: false
        })
        .then(() => {

            auth
            .signOut()
            .then(() => {
                //successfully
                localStorage.clear();
                dispatch({type: `${authConstanst.USER_LOGOUT}_SUCCESS`});
            })
            .catch(error => {
                console.log(error);
                dispatch({ type: `${authConstanst.USER_LOGOUT}_FAILURE`, payload: { error } })
            })

        })
        .catch(error => {
            console.log(error);
        })*/

        


    }
}

