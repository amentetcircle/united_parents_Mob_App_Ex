import React from "react";
import {getDatabase, ref, child, get, set} from "firebase/database";

// all changes on this page by Katharina Zirkler

// todo: only show edit button if user is admin
// done: change state for all content toggles
// done: make changes stay (backend)
//      -> mockup testContent / Content1 holt sich Inhalt in Firebase?
// done: use componentdidmount for initial DB fetch instead of constructor
// done: introduce arguments to change different content boxes
// todo: submit changes in HelpFinances for entire page
// todo: possibility to add Infoboxes in edit-mode
// todo: format input (font style, ....)
// todo: same on Home

class HelpFinances extends React.Component {

    constructor(props) {
        super(props);
        this.toggleEditMode = this.toggleEditMode.bind(this)
        this.submitChanges = this.submitChanges.bind(this)
        this.state = {
            editMode: false
        }
    }

    submitChanges() {
        // to be implemented

        this.toggleEditMode()
    }

    toggleEditMode() {
        this.setState({
            editMode: !this.state.editMode
        });
    }

    render() {
        return <div>
            <h1>Hilfe & Finanzen</h1>
            <button className="help-button-edit icons-container" onClick={this.toggleEditMode}>
                <span className="material-icons">edit_note</span>
            </button>
            <br/>

            <InfoBox path="content1" toggle={this.state.editMode}/>
            <InfoBox path="content2" toggle={this.state.editMode}/>
            {this.state.editMode ?
                <div>
                    <button className="help-button-save zip-button" onClick={this.submitChanges}>Speichern</button>
                </div>
                : null}
        </div>;
    }
}


class InfoBox extends React.Component {

    initialTitle = "Title"
    initialContent = "Content"


    constructor(props) {
        super(props);
        this.path = this.props.path
        this.state = {
            title: this.initialTitle,
            content: this.initialContent
        };
        this.db = getDatabase()
        this.updateContent = this.updateContent.bind(this)
        this.submitChangesTitle = this.submitChangesTitle.bind(this)
        this.submitChangesContent = this.submitChangesContent.bind(this)
    }

    componentDidMount() {
        this.updateContent()
        this.updateTitle()
    }

    updateContent() {
        get(child(ref(this.db), "Help/" + this.path + "/content")).then((snapshot) => {
            if (snapshot.exists()) {
                this.setState(
                    {
                        content: snapshot.val()
                    }
                )
            } else {
                alert("No data available");
            }
        }).catch((error) => {
            alert(error);
        });
    }

    updateTitle() {
        get(child(ref(this.db), "Help/" + this.path + "/title")).then((snapshot) => {
            if (snapshot.exists()) {
                this.setState(
                    {
                        title: snapshot.val()
                    }
                )
            } else {
                alert("No data available");
            }
        }).catch((error) => {
            alert(error);
        });
    }

    submitChangesTitle() {
        if (this.element.value !== '') {
            this.setState({
                title: this.element.value
            })
            let _value = this.element.value
            set(ref(this.db, 'Help/' + this.path), {
                title: _value
            }).then(() => {
            });
            this.updateContent()
        }
    }

    submitChangesContent() {
        if (this.element.value !== '') {
            this.setState({
                content: this.element.value
            })
            let _value = this.element.value
            set(ref(this.db, 'Help/' + this.path), {
                content: _value
            }).then(() => {
            });
            this.updateContent()
        }
    }


    render() {
        return (
            <div className="content-box help">
                <div className="uni-logo">
                    <img src="./images/fra-uas-logo.svg" className="logo-img" alt="Fra-UAS"></img>
                </div>
                <h1 className="primary">{this.state.title}</h1>
                {this.props.toggle ?
                    <div className='popup'>
                        <div>
                            <label>Neuer Titel:</label>
                            <input ref={el => this.element = el}></input>
                            {/*<button onClick={() => this.submitChangesTitle}>Speichern</button>*/}
                        </div>
                    </div>
                    : null
                }

                <p className="text help-p">{this.state.content}
                    {this.props.toggle ?
                        <div className='popup'>
                            <div>
                                <label>Neuer Inhalt:</label>
                                <textarea ref={el => this.element = el}></textarea>
                                {/*<button onClick={() => this.submitChangesContent}>Speichern</button>*/}
                            </div>
                        </div>
                        : null
                    }
                </p>
            </div>
        );
    }
}


function Help() {

    return <HelpFinances/>

}

export default Help;
