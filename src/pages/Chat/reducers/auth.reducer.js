import { authConstanst } from "../actions/constants"

const initState = {
    displayName: '',
    email: '',

}

export default (state = initState, action) => {

    console.log(action);

    switch(action.type){

        case `${authConstanst.USER_LOGIN}_REQUEST`:
            state = {
                ...state,

            }
            break;
        case `${authConstanst.USER_LOGIN}_SUCCESS`:
            state = {
                ...state,
                ...action.payload.user,

            }
            break;
        case `${authConstanst.USER_LOGIN}_FAILURE`:
            state = {
                ...state,

            }
            break;
        case `${authConstanst.USER_LOGOUT}_REQUEST`:
            break;
        case `${authConstanst.USER_LOGOUT}_SUCCESS`:
            state = {
                ...initState
            }
            break;


    }


    return state;
}