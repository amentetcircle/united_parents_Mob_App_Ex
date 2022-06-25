import React, {Component} from "react";
import {child, get, ref, set, update} from "firebase/database";
import {rtDatabase} from "../Firebase";
import {useUserAuth} from "../context/UserAuthContext";

// all changes on this page by Katharina Zirkler

// done: only show edit button / restric pages if user is admin
// tobedone: format input (font style, ....) -> ready-to-use editor => Tim
//       caution: DB can only store plain text!
// done: fix text overflow with words longer than width
// todo: remove box immediately when pressing delete?
// todo: toggle delete without abbrechen
// done: wrap words longer than field
// done: addBox with exemplary content


export class EditablePage extends Component {

    _listOfNodes = {}
    _listOfKeys = []


    constructor(props) {
        super(props)
        this.path = props.path
        this.state = {
            contentOfBoxes: {},
            toBeWrittenToDB: {},
            toBeDeletedFromDB: [],
            editMode: false,
            submitDisabled: true,
            listOfKeys: [],
            userIsAdmin: props.admin
        }
        this.fetchContent = this.fetchContent.bind(this)
        this.toggleEditMode = this.toggleEditMode.bind(this)
        this.receiveChildData = this.receiveChildData.bind(this)
        this.checkIfNodeExists = this.checkIfNodeExists.bind(this)
        this.addToDB = this.addToDB.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)
        this.swapPosition = this.swapPosition.bind(this)
        this.abortChanges = this.abortChanges.bind(this)
        // this.isAdmin = this.isAdmin.bind(this)
    }

    componentDidMount() {
        this.fetchContent()
    }

    // async isAdmin() {
    //     try {
    //         const docRef = doc(fsDatabase, "user", auth.currentUser.uid.toString());
    //         const docSnap = await getDoc(docRef)
    //         if (docSnap.exists()) {
    //             const userInfo = docSnap.data()
    //             alert("admin: " + userInfo.admin)
    //             this.setState({
    //                 userIsAdmin: userInfo.admin
    //             })
    //         } else {
    //             alert("No such document!")
    //         }
    //
    //     } catch (e) {
    //         alert(e)
    //     }
    // }

    fetchContent() {
        // fetches the current database content of this page's table
        // if successful, updates this state with fetched data
        get(child(ref(rtDatabase), this.path)).then((snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach(node => {
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
            editMode: !this.state.editMode,
            submitDisabled: true,
        });
    }

    handleSubmit() {
        if (Object.keys(this.state.toBeWrittenToDB).length !== 0 || this.state.toBeDeletedFromDB.length !== 0) {

            // 1. setstate CoB w/ tbwDB
            try {
                let tempMap = {}
                Object.entries(this.state.contentOfBoxes).map(([key, value]) => {
                    tempMap[key] = value
                })
                Object.entries(this.state.toBeWrittenToDB).map(([key, value]) => {
                    tempMap[key] = value
                })

                // 2. delete tbd boxes in state
                let tempMap2 = {}
                Object.entries(tempMap).map(([key, value]) => {
                    if (this.state.toBeDeletedFromDB.indexOf(key) === -1) {
                        tempMap2[key] = value
                    }
                })

                // 3. update content order in state CoB (taking out blank positions)
                Object.entries(tempMap2)
                    .sort((a, b) => a[1]["position"] - b[1]["position"])
                    .forEach(([key, value], index) => {
                        if (value["position"] !== (index + 1)) {
                            value["position"] = (index + 1)
                        }
                    })

                // 4. update content in DB
                set(ref(rtDatabase, this.path), tempMap2).then(() => {
                    this.setState({
                        toBeWrittenToDB: {},
                        toBeDeletedFromDB: [],
                        contentOfBoxes: tempMap2
                    })
                    this.toggleEditMode()
                })
            } catch (e) {
                alert(e)
            }
        } else {
            this.toggleEditMode()
        }
    }

    abortChanges() {
        this.setState({
            toBeWrittenToDB: {},
            toBeDeletedFromDB: [],
        })
        this.toggleEditMode()
    }

    checkIfNodeExists(position) {
        return new Promise((resolve, _) => {
            let _position = position
            let _path = "content" + _position.toString()
            try {
                get(ref(rtDatabase, this.path + [_path.toString()]))
                    .then((snapshot) => {
                        if (snapshot.exists()) {
                            _position++
                            resolve(this.checkIfNodeExists(_position))
                        } else {
                            resolve(_position)
                        }
                    })
            } catch (e) {
                alert(e)
            }
        })
    }

    addToDB() {
        // submits the content of newly added content boxes to the database

        try {
            let _position = this.state.listOfKeys.length + 1
            this.checkIfNodeExists(_position).then((pos) => {
                let _path = "content" + pos.toString()
                let _value = {"content": "Hier kannst du deinen Inhalt einfügen und anpassen. " +
                        "Abhängig davon ob du einen Titel vergibst oder nicht, wird das Logo " +
                        "der Fra-UAS automatisch eingefügt.",
                    "title": "Titel", "position": pos}
                set(ref(rtDatabase, this.path + _path), _value).then(() => {
                    let tempMap = {...this.state.contentOfBoxes}
                    tempMap[_path] = _value
                    this.setState({
                        contentOfBoxes: tempMap
                    })
                    if (!this.state.editMode) {
                        this.toggleEditMode()
                        window.scroll(0, document.body.scrollHeight)
                    }
                })
            })
        } catch (e) {
            alert(e)
        }
    }

    swapPosition(upperKey) {
        try {
            let tempList = Object.entries(this.state.contentOfBoxes).map((entry) => entry)
            tempList.sort((a, b) => a[1]["position"] - b[1]["position"])
                .forEach(([key, val], index, array) => {
                    if (key === upperKey) {
                        let tempUpperPosition = val.position
                        val.position = array[index + 1][1].position
                        array[index + 1][1].position = tempUpperPosition
                    }
                })

            let tempState = {}
            tempList.forEach(([key, val]) => {
                tempState[key] = val
            })
            update(ref(rtDatabase, this.path), tempState).then(r => {
                this.setState({
                    contentOfBoxes: tempState
                })
            })

        } catch
            (e) {
            alert(e)
        }
    }

    receiveChildData(node) {
        // updates this state with data prepared by the content boxes
        try {
            let _node = Object.entries(node)[0]
            let _path = _node[0]
            let _value = _node[1]

            if (_value['content'] === "" && _value['title'] === "") {
                let _listOfNode = [...this.state.toBeDeletedFromDB]
                if (_listOfNode.indexOf(_path) === -1)
                    _listOfNode.push(_path)
                this.setState({
                    toBeDeletedFromDB: _listOfNode,
                    submitDisabled: false
                })
            } else {
                let _listOfNode = {...this.state.toBeWrittenToDB}
                _listOfNode[_path] = _value
                let _toBeDeleted = [...this.state.toBeDeletedFromDB]
                if (_toBeDeleted.indexOf(_path) !== -1)
                    _toBeDeleted.splice(_toBeDeleted.indexOf(_path), 1)
                this.setState({
                    toBeWrittenToDB: _listOfNode,
                    submitDisabled: false,
                    toBeDeletedFromDB: _toBeDeleted
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
            .forEach(([key, value], index, array) => {
                    listOfInfoboxes.push(
                        <div className="editable">
                            <InfoBox
                                path={key}
                                content={value['content']}
                                title={value['title']}
                                position={value['position']}
                                toggle={this.state.editMode}
                                submitData={this.receiveChildData}
                            />
                            {
                                this.state.userIsAdmin && !editToggled ?
                                    (index + 1) !== array.length ?
                                        <button className="editable-material-button swap icons-container"
                                                onClick={() => this.swapPosition(key)}>
                                            <span className="material-icons">swap_vert</span>
                                        </button>
                                        :
                                        <button className="editable-material-button swap icons-container"
                                                onClick={this.addToDB}>
                                            <span className="material-icons">add_box</span>
                                        </button>
                                    : this.state.userIsAdmin && editToggled && (index + 1) === array.length ?
                                        <button className="editable-material-button swap icons-container"
                                                onClick={this.addToDB}>
                                            <span className="material-icons">add_box</span>
                                        </button>
                                        : null
                            }
                        </div>
                    )
                }
            )

        return (
            <div>
                <div>
                    {this.state.userIsAdmin ?
                        <button className="editable-material-button edit icons-container" onClick={() => {
                            if (editToggled) {
                                if (window.confirm("Änderungen speichern?")) {
                                    this.handleSubmit()
                                } else {
                                    this.abortChanges()
                                }
                            } else {
                                this.toggleEditMode()
                            }
                        }}>
                            <span className="material-icons">edit_note</span>
                        </button>
                        : null
                    }

                </div>
                <br/><br/>

                {listOfInfoboxes}
                {editToggled ?
                    <div>
                        {this.state.submitDisabled ?
                            <button className="save zip-button" disabled
                            >Änderungen übernehmen
                            </button>
                            :
                            <button className="editable-button save zip-button" onClick={this.handleSubmit}>Änderungen
                                übernehmen
                            </button>
                        }
                        <button className="editable-button save zip-button"
                                onClick={this.abortChanges}>Abbrechen
                        </button>
                    </div>
                    : null
                }
            </div>);
    }
}

export class InfoBox extends Component {

    constructor(props) {
        super(props);
        this.state = {
            _title: "",
            _content: "",
            deleteCheck: false,
            sentCheck: false
        };
        this.handleInputChange = this.handleInputChange.bind(this)
        this.sendDataToParent = this.sendDataToParent.bind(this)
        this.deleteThis = this.deleteThis.bind(this)
    }

    componentDidMount() {
        this.setState({
            _title: this.props.title,
            _content: this.props.content,
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.toggle !== prevProps.toggle) {
            this.setState({
                _title: this.props.title,
                _content: this.props.content,
                deleteCheck: false,
                sentCheck: false
            })
        }
    }

    sendDataToParent() {
        // passes the data that is to be submitted
        // to the database up to the parent

        try {
            let node = {
                "content": this.state._content,
                "title": this.state._title,
                "position": this.props.position
            }
            this.props.submitData({[this.props.path]: node})
        } catch (e) {
            alert(e)
        }
    }

    deleteThis() {
        this.setState({
            _content: "",
            _title: "",
            deleteCheck: true,
            sentCheck: false
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
            <div className="content-box">

                {this.props.title !== "" ?
                    <div className="uni-logo">
                        <img src="./images/fra-uas-logo.svg" className="logo-img" alt="Fra-UAS"></img>
                    </div> : null
                }

                {this.props.toggle ?
                    <div>
                        {this.state.deleteCheck ?
                            <button className="editable-material-button delete icons-container"
                                    onClick={this.deleteThis}>
                                <span className="material-icons overlay-check">done</span>
                                <span className="material-icons">delete</span>
                            </button> :
                            <button className="editable-material-button delete icons-container"
                                    onClick={this.deleteThis}>
                                <span className="material-icons">delete</span>
                            </button>}
                        <div>
                            <input className="editable-input"
                                   name="_title"
                                   value={this.state._title}
                                   onChange={this.handleInputChange}>
                            </input>
                        </div>
                        <div>
                        <textarea className="editable-textarea"
                                  name="_content"
                                  value={this.state._content}
                                  onChange={this.handleInputChange}>
                                </textarea>
                        </div>
                        {this.state.sentCheck ?
                            <button className="editable-material-button icons-container" type="submit"
                                    onClick={this.sendDataToParent}>
                                <span className="material-icons check">task_alt</span>
                            </button> :
                            <button className="editable-button zip-button" type="submit" onClick={() => {
                                this.sendDataToParent();
                                this.setState({sentCheck: true, deleteCheck: false})
                            }}>Änderungen vormerken
                            </button>}
                    </div> :
                    this.props.title !== "" ?
                        <div>
                            <h1 className="primary editable-t">{this.props.title}</h1>
                            <p className="text editable-p">{this.props.content}</p>
                        </div> :
                        <div>
                            <p className="text editable">{this.props.content}</p>
                        </div>}
            </div>

        );
    }
}
