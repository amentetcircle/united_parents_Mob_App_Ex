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
        // this.showToBeWritten = this.showToBeWritten.bind(this)
        this.state = {
            contentOfBoxes: [],
            _toBeWrittenToDB: {},
            editMode: false,
            listOfKeys: []
        }
        this.updateContent = this.updateContent.bind(this)
        // this.childMethodInParent = this.childMethodInParent.bind(this)
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
                    // alert("keys: " + this.state.listOfKeys);
                    alert("inhalt: " + JSON.stringify(this.state.contentOfBoxes, null, ' '))
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

        // alert("updatedb")
        // alert(JSON.stringify(this.state._toBeWrittenToDB))
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
            // alert("receivechilddata: " + JSON.stringify(args))
            let _path = args[0]
            // alert("path: " + _path)
            let _value = args[1]
            // let _node = {[_path]: _value}
            // alert("node: " + JSON.stringify(_node[_path]))
            let _listOfNode = {...this.state._toBeWrittenToDB}
            // alert("listofnodes bei erstellung: " + JSON.stringify(_listOfNode))
            _listOfNode[_path] = _value
            // alert("listofnodes nach änderung: " + JSON.stringify(_listOfNode))
            this.setState({
                _toBeWrittenToDB: _listOfNode
            })
        } catch (e) {
            alert(e)
        }
    }

    // childMethodInParent(childMethod) {
    //     this.childMethod = childMethod
    // }
    //
    // showToBeWritten() {
    //     alert("in showtobewritten" + JSON.stringify(this.state._toBeWrittenToDB))
    // }

    render() {
        const editToggled = this.state.editMode
        const listOfInfoboxes = this.state.contentOfBoxes.map((item) => (
            <InfoBox
                path={item.key}
                content={item.child('content').val()}
                title={item.child('title').val()}
                toggle={editToggled}
                // triggerSubmit={this.childMethodInParent}
                submitData={this.receiveChildData}
            />))
        // const listOfInfoboxes = [
        //     <InfoBox
        //         path="content1"
        //         content="Es gibt BAFöG."
        //         title="Finanzielle Hilfen"
        //         toggle={editToggled}
        //         submitData={click => this.clickChild = click}
        //         db ={this.db}
        //     />,
        //     <InfoBox
        //         path="content2"
        //         content="Das Familienbüro hilft dir gerne weiter."
        //         title="Weitere Hilfen"
        //         toggle={editToggled}
        //         submitData={click => this.clickChild = click}
        //         db ={this.db}
        //     />
        // ]

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
                {editToggled ? <div>
                    {/*<button className="help-button-save zip-button" onClick={() => this.receiveChildData}>Get Data</button>*/}
                    {/*<button className="help-button save zip-button" onClick={() => this.childMethod()}>Get Data</button>*/}
                    <button className="help-button save zip-button" type="submit"
                            onClick={this.updateDB}>Speichern
                    </button>
                    {/*<button className="help-button save zip-button" onClick={this.showToBeWritten}>show</button>*/}
                </div> : null}
            </div>);
    }
}


class InfoBox extends React.Component {

    constructor(props) {
        super(props);
        this.path = this.props.path
        this.state = {
            _title: "",
            _content: "",
        };
        // this.submitChanges = this.submitChanges.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.sendDataToParent = this.sendDataToParent.bind(this)
    }

    componentDidMount() {
        // setting state here instead of directly in the constructor avoids the need
        // to refresh the page after an update to the database was made
        this.setState({
            _title: this.props.title, _content: this.props.content
        })
        // this.updateContent()
        // this.updateTitle()
        // this.props.triggerSubmit(this.sendDataToParent)
    }

    sendDataToParent() {
        // passes the data that is to be submitted
        // to the database up to the parent

        // alert("triggered in child" + this.path)
        let node = {
            "content": this.state._content,
            "title": this.state._title
        }
        this.props.submitData([this.path, node])
    }

    /*deprecated*/
    // updateContent() {
    //     get(child(ref(this.props.db), "Help/" + this.path + "/content")).then((snapshot) => {
    //         if (snapshot.exists()) {
    //             this.setState(
    //                 {
    //                     content: snapshot.val()
    //                 }
    //             )
    //         } else {
    //             alert("No data available");
    //         }
    //     }).catch((error) => {
    //         alert(error);
    //     });
    // }
    //
    // updateTitle() {
    //     get(child(ref(this.props.db), "Help/" + this.path + "/title")).then((snapshot) => {
    //         if (snapshot.exists()) {
    //             this.setState(
    //                 {
    //                     title: snapshot.val()
    //                 }
    //             )
    //         } else {
    //             alert("No data available");
    //         }
    //     }).catch((error) => {
    //         alert(error);
    //     });
    // }
    //
    // submitChanges() {
    //     if (this.state._title !== '') {
    //         this.setState({
    //             title: this.state._title
    //         })
    //     }
    //     if (this.state._content !== '') {
    //         this.setState({
    //             content: this.state._content
    //         })
    //     }
    //     alert(this.state.title)
    //     alert(this.state.content)
    //
    //     set(ref(rtDatabase, 'Help/' + this.path), {
    //         title: this.state.title, content: this.state.content
    //     }).then(() => {
    //     });
    //     this.setState({
    //         _title: '', _content: ''
    //     })
    // }

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
                <div className="uni-logo help">
                    <img src="./images/fra-uas-logo.svg" className="logo-img" alt="Fra-UAS"></img>
                </div>

                {this.props.toggle ? <div className='popup'>
                    <div>
                        {/*<label>Neuer Titel:</label>*/}
                        <input name="_title"
                               value={this.state._title}
                               onChange={this.handleInputChange}>
                        </input>
                    </div>
                    <div>
                        {/*<label>Neuer Inhalt:</label>*/}
                        <textarea className="help-textarea"
                                  name="_content"
                                  value={this.state._content}
                                  onChange={this.handleInputChange}>
                                </textarea>
                    </div>
                    <button className="help-button zip-button" type="submit" onClick={this.sendDataToParent}>Send Data
                    </button>
                </div> : <div>
                    <h1 className="primary">{this.props.title}</h1>
                    <p className="text help-p">{this.props.content}</p>
                </div>}
            </div>);
    }
}


function Help() {

    return <HelpFinances/>

}

export default Help;