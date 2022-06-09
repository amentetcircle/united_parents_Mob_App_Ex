import React, {Component} from "react";
import {child, get, ref, remove, set, update} from "firebase/database";
import {rtDatabase} from "../Firebase";

// all changes on this page by Katharina Zirkler

// todo: only show edit button if user is admin
// done: change state for all content toggles
// done: make changes stay (backend)
//       -> mockup testContent / Content1 holt sich Inhalt in Firebase?
// done: use componentdidmount for initial DB fetch instead of constructor
// done: introduce arguments to change different content boxes
// done: submit changes in HelpFinances for entire page
// done: possibility to add/delete (/switch? ) Infoboxes in edit-mode
// todo: format input (font style, ....) -> ready-to-use editor?
//       caution: DB can only store plain text!
// done: same on Home

export class EditablePage extends Component {

    _listOfNodes = {}
    _listOfKeys = []
    userIsAdmin = true

    constructor(props) {
        super(props);
        this.toggleEditMode = this.toggleEditMode.bind(this)
        this.updateDB = this.updateDB.bind(this)
        this.path = props.path
        this.state = {
            contentOfBoxes: {},
            toBeWrittenToDB: {},
            toBeDeletedFromDB: [],
            editMode: false,
            listOfKeys: []
        }
        this.fetchContent = this.fetchContent.bind(this)
        this.receiveChildData = this.receiveChildData.bind(this)
        this.addToDB = this.addToDB.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
    }

    componentDidMount() {
        this.fetchContent()
    }

    fetchContent() {
        // fetches the current database content of this page's table
        // if successful, updates this state with fetched data
        get(child(ref(rtDatabase), this.path)).then((snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach(node => {
                    // alert(JSON.stringify(node))
                    this._listOfNodes[node.key] = node.val()
                    this._listOfKeys.push(node.key)
                })
                this.setState({
                    contentOfBoxes: this._listOfNodes,
                    listOfKeys: this._listOfKeys
                }, () => {
                    this._listOfNodes = {}
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

    handleSubmit() {

        // 1. setstate CoB w/ tbwDB
        try {
            let tempMap = {}
            Object.entries(this.state.contentOfBoxes).map(([key, value]) => {
                // alert("in handlesubmit: " + key + ": " + JSON.stringify(value))
                tempMap[key] = value
            })
            Object.entries(this.state.toBeWrittenToDB).map(([key, value]) => {
                // alert("in tbw: " + key + ": " + JSON.stringify(value))
                tempMap[key] = value
            })
            // alert(JSON.stringify(tempMap))

            // 2. delete tbd boxes in state
            let tempMap2 = {}
            Object.entries(tempMap).map(([key, value]) => {
                // alert("in delete boxes: " + key + ": " + JSON.stringify(value))
                if (this.state.toBeDeletedFromDB.indexOf(key) === -1) {
                    // alert("keep" + key)
                    tempMap2[key] = value
                }
            })
            // alert(JSON.stringify(tempMap))

            // 3. update content order in state CoB (taking out blank positions)
            Object.entries(tempMap2)
                .sort((a, b) => a[1]["position"] - b[1]["position"])
                .forEach(([key, value], index) => {
                    // alert(key + " <-key / index ->" + index)
                    if (value["position"] !== (index + 1)) {
                        value["position"] = (index + 1)
                    }
                })

            // 3. update content in DB
            set(ref(rtDatabase, this.path), tempMap2).then()

            // 5. remove unnecessary fields in DB


            this.fetchContent()
            this.toggleEditMode()
        } catch (e) {
            alert(e)
        }
    }

    updateDB() {
        // submits the content that was prepared to be changed to the database
        alert(JSON.stringify(this.state.toBeWrittenToDB))
        alert(JSON.stringify(this.state.toBeDeletedFromDB))

        try {
            this.state.toBeDeletedFromDB.forEach(item => {
                // alert(this.path + item)
                // this.deleteFromDB(item)
                remove(ref(rtDatabase, this.path + item)).then(() => {
                    alert("deleted " + item)
                    // todo: reshuffle content
                })
            })
            this.setState({
                toBeDeletedFromDB: []
            })
            update(ref(rtDatabase, this.path), this.state.toBeWrittenToDB).then(() => {
                this.setState({
                    toBeWrittenToDB: {}
                })
                this.fetchContent()
                this.toggleEditMode()
            })
        } catch (e) {
            alert(e)
        }
    }

    addToDB() {
        // submits the content of newly added content boxes to the database
        // alert(JSON.stringify(this.state.contentOfBoxes))
        let _path = "content" + (this.state.listOfKeys.length * 2).toString()
        let _value = {"content": "", "title": "", "position": (this.state.listOfKeys.length + 1)}
        set(ref(rtDatabase, this.path + _path), _value).then(() => {
            this.fetchContent()
        })
    }

    receiveChildData(node) {
        // updates this state with data prepared by the content boxes
        // alert(JSON.stringify(node))
        try {
            let _node = Object.entries(node)[0]
            let _path = _node[0]
            let _value = _node[1]
            // alert(_node)
            // alert(_path)
            // alert(JSON.stringify(_value))
            if (_value['content'] === "" && _value['title'] === "") {
                let _listOfNode = [...this.state.toBeDeletedFromDB]
                if (_listOfNode.indexOf(_path) === -1)
                    _listOfNode.push(_path)
                this.setState({
                    toBeDeletedFromDB: _listOfNode
                })
            } else { // todo: check if present in tbdeleted -> remove there
                let _listOfNode = {...this.state.toBeWrittenToDB}
                _listOfNode[_path] = _value
                this.setState({
                    toBeWrittenToDB: _listOfNode
                })
            }
        } catch (e) {
            alert(e)
        }
    }

    render() {
        const editToggled = this.state.editMode
        let listOfInfoboxes = []
        Object.entries(this.state.contentOfBoxes)
            .sort((a, b) => a[1]["position"] - b[1]["position"])
            .forEach(([key, value]) => (
                    listOfInfoboxes.push(
                        <InfoBox
                            path={key}
                            content={value['content']}
                            title={value['title']}
                            position={value['position']}
                            toggle={editToggled}
                            submitData={this.receiveChildData}
                        />
                    )
                )
            )

        return (
            <div>
                <div>
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
                        {/*<button className="help-button save zip-button" onClick={this.updateDB}>Speichern</button>*/}
                        <button className="help-button save zip-button" onClick={this.handleSubmit}>Submit</button>
                        <button className="help-button save zip-button" onClick={this.addToDB}>noch ne Box</button>
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
        this.deleteThis = this.deleteThis.bind(this)
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
            "title": this.state._title,
            "position": this.props.position
        }
        this.props.submitData({[this.path]: node})
    }

    deleteThis() {
        this.setState({
            _content: "",
            _title: ""
        }, () => this.sendDataToParent())

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

                {this.props.toggle ?
                    <div>
                        <button className="help-button-delete icons-container" onClick={this.deleteThis}>
                            <span className="material-icons">delete</span>
                        </button>
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
                        <button className="help-button zip-button" type="submit" onClick={this.sendDataToParent}>Send
                            Data
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
