import React from "react";
import {EditablePage} from "./EditablePage";
import {useUserAuth} from "../context/UserAuthContext";

// Katharina Zirkler


function Help() {

    const {isAdmin} = useUserAuth()

    return <EditablePage path="Help/" admin={isAdmin}/>

}

export default Help;
