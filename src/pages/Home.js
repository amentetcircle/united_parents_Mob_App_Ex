import React from "react";
import {EditablePage} from "./EditablePage";
import {useUserAuth} from "../context/UserAuthContext";

/**
 * Katharina Zirkler
 * */

function Home() {

    /**
     * checks if User has admin rights, then opens the EditablePage with content
     * stored for the Home page
     */

    const {isAdmin} = useUserAuth()

    return <EditablePage path="Home/" admin={isAdmin}/>

}

export default Home;