import React from "react";
import {EditablePage} from "./EditablePage";
import {useUserAuth} from "../context/UserAuthContext";

// Katharina Zirkler

function Home() {

    const {isAdmin} = useUserAuth()

    return <EditablePage path="Home/" admin={isAdmin}/>

}

export default Home;