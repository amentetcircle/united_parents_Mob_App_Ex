import React from "react";
import {Editor, EditorState, getDefaultKeyBinding, RichUtils, convertFromRaw, convertToRaw} from "draft-js";
import '../../../united_parents_Mob_App_Ex/node_modules/draft-js/dist/Draft.css'
import ChatPage from "./Chat/containers/ChatPage";
import Layout from "./Chat/components/Layout";



function Settings(){
    return(

        <div>
        <ChatPage/>
      </div>

    );

}

export default Settings;
