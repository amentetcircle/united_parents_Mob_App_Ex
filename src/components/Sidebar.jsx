import React from "react";

function Sidebar() {
    return (
        <div>
            <aside class="sidebar">
  <div class="icons">

    <div class="icons-container">
      <a href="home" class="active">
        <span class="material-icons">home</span>
        <p>Startseite</p>
      </a>
    </div>

    <div class="icons-container">
      <a href="my-profile">
        <span class="material-icons">account_circle</span>
        <p>Mein Profil</p>
      </a>
    </div>


    <div class="icons-container">
      <a href="search-user">
        <span class=" material-icons">map</span>
        <p>User suchen</p>
      </a>
    </div>

    <div class="icons-container">
      <a href="ChatList">
        <span class="material-icons">forum</span>
        <p>Chats</p>
      </a>
    </div>

    <div class="icons-container">
      <a href="help-finances">
        <span class="material-icons">contact_support</span>
        <p>Hilfe & Finanzen</p>
      </a>
    </div>

    <div class="icons-container">
      <a href="settings">
        <span class="material-icons">settings</span>
        <p>Einstellungen</p>
      </a>
    </div>

    <div class="icons-container">
      <a href="logout">
        <span class="material-icons">logout</span>
        <p>Abmelden</p>
      </a>
    </div>

  </div>
</aside>

        </div>
      );
}
 
export default Sidebar;