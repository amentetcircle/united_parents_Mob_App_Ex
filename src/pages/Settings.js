import React from "react";
import {Editor, EditorState, getDefaultKeyBinding, RichUtils, convertFromRaw, convertToRaw} from "draft-js";
import '../../../united_parents_Mob_App_Ex/node_modules/draft-js/dist/Draft.css'
import HomePage from "./Chat/containers/HomePage";

var style;
var counter = 0;

// inspired by https://reactrocket.com/post/draft-js-persisting-content/

function Settings(){
    return(
      <div>
             <HomePage/>

      </div>
    );

}

export default Settings;
