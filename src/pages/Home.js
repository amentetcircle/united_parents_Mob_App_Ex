import React, {Component} from "react";
import {child, get, ref, update} from "firebase/database";
import {rtDatabase} from "../Firebase";
import {InfoBox} from "./HelpFinances";

// all changes on this page by Katharina Zirkler

class HomePage extends Component {

    _listOfNodes = []
    _listOfKeys = []
    userIsAdmin = true

    constructor(props) {
        super(props);
        this.toggleEditMode = this.toggleEditMode.bind(this)
        this.updateDB = this.updateDB.bind(this)
        this.state = {
            contentOfBoxes: [],
            _toBeWrittenToDB: {},
            editMode: false,
            listOfKeys: []
        }
        this.updateContent = this.updateContent.bind(this)
        this.receiveChildData = this.receiveChildData.bind(this)
    }

    componentDidMount() {
        this.updateContent()
    }

    updateContent() {
        // fetches the current database content of this page's table
        // if successful, updates this state with fetched data
        get(child(ref(rtDatabase), "Home/")).then((snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach(node => {
                    this._listOfNodes.push(node)
                    this._listOfKeys.push(node.key)
                })
                this.setState({
                    contentOfBoxes: this._listOfNodes,
                    listOfKeys: this._listOfKeys
                }, () => {
                    this._listOfNodes = [];
                    this._listOfKeys = []
                })
            } else {
                alert("No data available")
            }
        }).catch((error) => {
            alert(error);
        });
    }

    toggleEditMode() {
        this.setState({
            editMode: !this.state.editMode
        });
    }

    updateDB() {
        // submits the content that was prepared to be changed to the database

        try {
            update(ref(rtDatabase, 'Home'), this.state._toBeWrittenToDB).then(() => {
                this.setState({
                    _toBeWrittenToDB: []
                })
                this.updateContent()
                this.toggleEditMode()
            })
        } catch (e) {
            alert(e)
        }
    }

    // addToDB() {
    //     // submits the content of newly added content boxes to the database
    //     // to be implemented
    // }
    //
    // deleteFromDB() {
    //     // submits the deletion of content boxes to the database
    //     // to be implemented
    // }

    receiveChildData(args) {
        // updates this state with data prepared by the content boxes
        try {
            let _path = args[0]
            let _value = args[1]
            let _listOfNode = {...this.state._toBeWrittenToDB}
            _listOfNode[_path] = _value
            this.setState({
                _toBeWrittenToDB: _listOfNode
            })
        } catch (e) {
            alert(e)
        }
    }

    render() {
        const editToggled = this.state.editMode
        const listOfInfoboxes = this.state.contentOfBoxes.map((item) => (
            <InfoBox
                path={item.key}
                content={item.child('content').val()}
                title={item.child('title').val()}
                toggle={editToggled}
                submitData={this.receiveChildData}
            />))

        return (
            <div>
                <div>
                <br/>
                    {this.userIsAdmin ?
                        <button className="help-button-edit icons-container" onClick={this.toggleEditMode}>
                            <span className="material-icons">edit_note</span>
                        </button>
                        : null
                    }

                </div>
                <br/><br/>

                {listOfInfoboxes}
                {editToggled ? <div>
                    <button className="help-button save zip-button" type="submit"
                            onClick={this.updateDB}>Speichern
                    </button>
                </div> : null}
            </div>);
    }
}


function Home() {

    return (
        <HomePage/>
    )
}

export default Home;