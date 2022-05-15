import React from "react";
import {Routes, Route} from "react-router-dom";
import {UserAuthContextProvider} from "../context/UserAuthContext"

import Login from "../pages/Login";
import Home from "../pages/Home";
import MyProfile from "../pages/MyProfile";
import SearchUser from "../pages/SearchUser";
import Chats from "../pages/Chats";
import Help from "../pages/HelpFinances";
import Settings from "../pages/Settings";
import ProtectedRoutes from "./ProtectedRoutes";
import Registration from "../pages/Registration";
import SidebarLogReg from "./SidebarLogReg";
import ChatsList from "../pages/ChatList";

function App() {
    return (
        <div>
            <SidebarLogReg/>

            <div className="contents-container">

                <UserAuthContextProvider>
                    <Routes>
                        <Route
                            path="/my-profile"
                            element={<ProtectedRoutes> <MyProfile/> </ProtectedRoutes>}/>
                        <Route
                            path="/search-user"
                            element={<ProtectedRoutes> <SearchUser/> </ProtectedRoutes>}/>
                        <Route
                            path="/chats"
                            element={<ProtectedRoutes > <ChatsList/> </ProtectedRoutes>}/>
                        <Route
                            path="/help-finances"
                            element={<ProtectedRoutes > <Help/> </ProtectedRoutes>}/>
                        <Route
                            path="/settings"
                            element={<ProtectedRoutes > <Settings/> </ProtectedRoutes>}/>
                        <Route path="/home" element={<ProtectedRoutes > <Home/> </ProtectedRoutes>}/>
                        <Route path="/" element={< Login />}/>
                        <Route path="/logout" element={< Login />}/>
                        <Route path="/registration" element={< Registration />}/>
                    </Routes>

                </UserAuthContextProvider>
            </div>
        </div>
    );
}

export default App;

/*
<div>
            <Header />
            <Sidebar />
                <div className="contents-container">
                    <BrowserRouter>
                        <Routes>
                            <Route path="" element={}>
                            <Route path="/registration" element={<Registration />} />
                            </Route>
                             <Route path="/home" element={<Home />} />
                            <Route path="/my-profile" element={<MyProfile />} />
                            <Route path="/search-user" element={<SearchUser />} />
                            <Route path="/chats" element={<Chats />} />
                            <Route path="/help-finances" element={<Help />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/logout" element={<Login />} />
                         </Routes>
                    </BrowserRouter>
                </div>
            </div>
*/