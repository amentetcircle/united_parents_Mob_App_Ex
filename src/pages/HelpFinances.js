import React from "react";
import {EditablePage} from "./EditablePage";
import {useUserAuth} from "../context/UserAuthContext";

/**
 * Katharina Zirkler
 * */


function Help() {

    /**
     * checks if User has admin rights, then opens the EditablePage with content
     * stored for the Help&Finances page
     */

    const {isAdmin} = useUserAuth()

    return <EditablePage path="Help/" admin={isAdmin}/>

}

export default Help;
