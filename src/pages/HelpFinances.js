import React from "react";
import { getDatabase, ref, child, get, set } from "firebase/database";

// all changes on this page by Katharina Zirkler
// todo: only show edit button if user is admin
// todo: make changes stay (backend)
//      -> mockup testContent / Content1 holt sich Inhalt in Firebase?
// todo: possibility to add <p>
// todo: format input? (line breaks, font weight, ....)


class HelpFinances extends React.Component {

    testContent = "This is as random a text as I could go. Pretend it's Lorem Ipsum etc" // todo: get content from db

    constructor(props) {
        super(props);
        this.state = {
            showPopup: false,
            content1: this.testContent
        };
        this.togglePopup = this.togglePopup.bind(this)
        this.submitChanges = this.submitChanges.bind(this)
    }

    submitChanges() {
        if (this.element.value !== '') {
            this.setState({
                content1: this.element.value
            })
            set(ref(getDatabase(), 'Help/'), {
                Content1: this.element.value,
            }).then(r => {});
            const dbRef = ref(getDatabase());
            get(child(dbRef, `Help/Content1`)).then((snapshot) => {
                if (snapshot.exists()) {
                    alert(snapshot.val());
                } else {
                    alert("No data available");
                }
            }).catch((error) => {
                alert(error);
            });
        }
        this.togglePopup()
    }

    togglePopup() {
        this.setState({
            showPopup: !this.state.showPopup
        });
    }

    render() {
        return (
            <div>
                <h1>Hilfe & Finanzen</h1>
                <div className="content-box">
                    <h1 className="primary">Hilfestellungen für dein Studium</h1>
                    <button onClick={this.togglePopup.bind(this)}>Ändere Inhalt</button>

                    <p id="textHelp1" className="text">{this.state.content1}
                        {this.state.showPopup ?
                            <div className='popup'>
                                <div className='popup_inner'>
                                    <label>Neuer Inhalt:</label>
                                    <input ref={el => this.element = el}></input>
                                    <button onClick={this.submitChanges}>Speichere Änderungen</button>
                                </div>
                            </div>
                            : null
                        }
                    </p>
                </div>
            </div>
        );
    }
}

function Help() {
    return <HelpFinances/>;
}

export default Help;


// import React from "react";
//
// function Help() {
//     return (
//         <div>
//             <h1>Hilfe & Finanzen</h1>
//         </div>
//     );
// }
//
// export default Help;