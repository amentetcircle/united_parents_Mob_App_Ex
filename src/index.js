import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from "react-router-dom";
// The bootstrap import overrides almost all custom styles
import 'bootstrap/dist/css/bootstrap.min.css'
import App from "./components/App";
import {Provider} from "react-redux";
import store from "./pages/Chat/store";

window.store = store;

ReactDOM.render(
    <Provider store={store}>
        <Router><App/></Router></Provider>, document.getElementById("root")

);
