import React, {Component} from "react";
import {ref, child, get, update} from "firebase/database";
import {rtDatabase} from "../Firebase";

// all changes on this page by Katharina Zirkler

// todo: only show edit button if user is admin
// done: change state for all content toggles
// done: make changes stay (backend)
//       -> mockup testContent / Content1 holt sich Inhalt in Firebase?
// done: use componentdidmount for initial DB fetch instead of constructor
// done: introduce arguments to change different content boxes
// done: submit changes in HelpFinances for entire page
// todo: possibility to add/delete (/switch? ) Infoboxes in edit-mode
// todo: format input (font style, ....) -> ready-to-use editor?
//       caution: DB can only store plain text!
// done-ish: same on Home

class HelpFinances extends Component {

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
        get(child(ref(rtDatabase), "Help/")).then((snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach(node => {
                    // alert(node.key)
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
            update(ref(rtDatabase, 'Help'), this.state._toBeWrittenToDB).then(() => {
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
                    <h1>Hilfe & Finanzen</h1>
                    {this.userIsAdmin ?
                        <button className="help-button-edit icons-container" onClick={this.toggleEditMode}>
                            <span className="material-icons">edit_note</span>
                        </button>
                        : null
                    }

                </div>
                <br/><br/>

                {listOfInfoboxes}
                {editToggled ?
                    <div>
                        <button className="help-button save zip-button" type="submit"
                                onClick={this.updateDB}>Speichern
                        </button>
                    </div> : null}
            </div>);
    }
}


export class InfoBox extends React.Component {

    constructor(props) {
        super(props);
        this.path = this.props.path
        this.state = {
            _title: "",
            _content: "",
        };
        this.handleInputChange = this.handleInputChange.bind(this)
        this.sendDataToParent = this.sendDataToParent.bind(this)
    }

    componentDidMount() {
        // setting state here instead of directly in the constructor avoids the need
        // to refresh the page after an update to the database was made
        this.setState({
            _title: this.props.title, _content: this.props.content
        })
    }

    sendDataToParent() {
        // passes the data that is to be submitted
        // to the database up to the parent

        let node = {
            "content": this.state._content,
            "title": this.state._title
        }
        this.props.submitData([this.path, node])
    }

    handleInputChange(event) {
        event.preventDefault()
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }


    render() {

        return (
            <div className="content-box help">
                {this.props.title !== "" ?
                    <div className="uni-logo help">
                        <img src="./images/fra-uas-logo.svg" className="logo-img" alt="Fra-UAS"></img>
                    </div> : null
                }

                {this.props.toggle ? <div className='popup'>
                        <div>
                            <input name="_title"
                                   value={this.state._title}
                                   onChange={this.handleInputChange}>
                            </input>
                        </div>
                        <div>
                        <textarea className="help-textarea"
                                  name="_content"
                                  value={this.state._content}
                                  onChange={this.handleInputChange}>
                                </textarea>
                        </div>
                        <button className="help-button zip-button" type="submit" onClick={this.sendDataToParent}>Send Data
                        </button>
                    </div> :
                    this.props.title !== "" ?
                        <div>
                            <h1 className="primary">{this.props.title}</h1>
                            <p className="text help-p">{this.props.content}</p>
                        </div> :
                        <div>
                            <p className="text help">{this.props.content}</p>
                        </div>}
            </div>);
    }
}


function Help() {

    return <HelpFinances/>

}

export default Help;
