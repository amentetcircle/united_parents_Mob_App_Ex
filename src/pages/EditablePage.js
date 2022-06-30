import React, {Component} from "react";
import {child, get, ref, set, update} from "firebase/database";
import {rtDatabase} from "../Firebase";
import {convertFromRaw, convertToRaw, Editor, EditorState, RichUtils, ContentState} from "draft-js";
import draftToHtml from 'draftjs-to-html';


/*
* draft.js
* Copyright (c) Facebook, Inc. and its affiliates.
*
* draftjs-to-html
* Copyright (c) 2016 Jyoti Puri
*
* both: MIT License
* Permission is hereby granted, free of charge, to any person obtaining a copy of this
* software and associated documentation files (the "Software"), to deal in the Software
* without restriction, including without limitation the rights to use, copy, modify, merge,
* publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
* to whom the Software is furnished to do so, subject to the following conditions:
* The above copyright notice and this permission notice shall be included in all copies or substantial
* portions of the Software.
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
* NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
* IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
* SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


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
    //             console.log("admin: " + userInfo.admin)
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
                    let _node = new Object(node.val())
                    console.log(_node)
                    let test = convertFromRaw(JSON.parse(node.val()['content']))
                    console.log(test)
                    _node['content'] = test
                    console.log(_node)
                    this._listOfNodes[node.key] = _node
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
                console.log("No data available")
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
                    // let temp = value
                    // temp.content = JSON.stringify(convertToRaw(value.content))
                    tempMap[key] = value
                })
                Object.entries(this.state.toBeWrittenToDB).map(([key, value]) => {
                    // this is already converted to raw
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
                console.log(e)
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
                let _value = {
                    "content": "Hier kannst du deinen Inhalt einfügen und anpassen. " +
                        "Abhängig davon ob du einen Titel vergibst oder nicht, wird das Logo " +
                        "der Fra-UAS automatisch eingefügt.",
                    "title": "Titel", "position": pos
                }
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
        this.receiveEditorState = this.receiveEditorState.bind(this)
    }

    componentDidMount() {
        // this.setState({
        //     _title: this.props.title,
        //     _content: ContentState.createFromText(this.props.content),
        // })
        this.setState({
            _title: this.props.title,
            _content: this.props.content
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

    receiveEditorState(es) {
        this.setState({
            editorstate: es,
            _content: JSON.stringify(convertToRaw(es.getCurrentContent())),
        })
    }

    convertToHTML() {
        // doesnt work yet
        try {
            console.log("in convert: ", this.state.editorState.getCurrentContent())
            const _body = draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()))
            console.log("in convert: ", _body)
            this.setState({
                body: _body
            })
        } catch (e) {
            alert(e)
        }
    }


    render() {

        // todo: zwischenschritt check ungewollte html-tags
        let _content = <div dangerouslySetInnerHTML={{__html: draftToHtml(convertToRaw(this.props.content))}} ></div>
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
                            {/*<textarea className="editable-textarea"
                                  name="_content"
                                  value={this.state._content}
                                  onChange={this.handleInputChange}>
                                </textarea>*/}
                            <RichEditorExample
                                value={this.props.content}
                                submit={this.receiveEditorState}>
                            </RichEditorExample>
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
                            <p className="text editable-p">{this.state.body != null ? this.state.body : _content}</p>
                        </div> :
                        <div>
                            <p className="text editable">{_content}</p>
                        </div>}
            </div>

        );

    }
}


class RichEditorExample extends React.Component {

    constructor(props) {
        super(props);
        try {
            const test = '{' +
                '      "entityMap": {},' +
                '      "blocks": [' +
                '        {' +
                '          "key": "e4brl",' +
                '          "text": "Lorem ipsum dolor sit amet, consectetuer adipiscing elit.",' +
                '          "type": "unstyled",' +
                '          "depth": 0,' +
                '          "inlineStyleRanges": [' +
                '            {' +
                '              "offset": 0,' +
                '              "length": 11,' +
                '              "style": "BOLD"' +
                '            },' +
                '            {' +
                '              "offset": 28,' +
                '              "length": 29,' +
                '              "style": "BOLD"' +
                '            },' +
                '            {' +
                '              "offset": 12,' +
                '              "length": 15,' +
                '              "style": "ITALIC"' +
                '            },' +
                '            {' +
                '              "offset": 28,' +
                '              "length": 28,' +
                '              "style": "ITALIC"' +
                '            }' +
                '          ],' +
                '          "entityRanges": [],' +
                '          "data": {}' +
                '        },' +
                '        {' +
                '          "key": "3bflg",' +
                '          "text": "Aenean commodo ligula eget dolor.",' +
                '          "type": "unstyled",' +
                '          "depth": 0,' +
                '          "inlineStyleRanges": [],' +
                '          "entityRanges": [],' +
                '          "data": {}' +
                '        }' +
                '      ]' +
                '    }'

            // works with mockup string
            // const content  = convertFromRaw(JSON.parse(test))
            // console.log(content)
            // const content = convertFromRaw(this.props.value)
            console.log(props.value)
            this.state = {
                editorState: EditorState.createWithContent(props.value)
            }
        } catch (e) {
            alert(e)
            this.state = {
                editorState: EditorState.createEmpty()
            }
        }

        // const content = null
        //
        // //const content = window.localStorage.getItem("content" + this.itsCounter);
        // if (content) {
        //     this.state.editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(content)));
        // } else {
        //     this.state.editorState = EditorState.createEmpty();
        // }
        this.focus = () => this.refs.editor.focus();
        this.onChange = (editorState) => {
            this.setState({editorState})
            this.props.submit(editorState)
        };

        this.handleKeyCommand = (command) => this._handleKeyCommand(command);
        this.toggleBlockType = (type) => this._toggleBlockType(type);
        this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
    }

    saveContent() {
        // this.props.submit(this.state.editorState)
    }

    _handleKeyCommand(command) {
        const {editorState} = this.state;
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.onChange(newState);
            return true;
        }
        return false;
    }

    _toggleBlockType(blockType) {
        this.onChange(
            RichUtils.toggleBlockType(
                this.state.editorState,
                blockType
            )
        );
    }

    _toggleInlineStyle(inlineStyle) {
        this.onChange(
            RichUtils.toggleInlineStyle(
                this.state.editorState,
                inlineStyle
            )
        );
    }

    onChange = (editorState) => {
        this.setState({
            editorState,
        })
    }

    render() {
        const {editorState} = this.state;

        // If the user changes block type before entering any text, we can
        // either style the placeholder or hide it. Let's just hide it now.
        let className = 'RichEditor-editor';
        const contentState = editorState.getCurrentContent();
        if (!contentState.hasText()) {
            if (contentState.getBlockMap().first().getType() !== 'unstyled') {
                className += ' RichEditor-hidePlaceholder';
            }
        }
        return (
            <div className="RichEditor-root">
                <BlockStyleControls
                    editorState={editorState}
                    onToggle={this.toggleBlockType}
                />
                <InlineStyleControls
                    editorState={editorState}
                    onToggle={this.toggleInlineStyle}
                />
                <div className={className} onClick={this.focus}>
                    <Editor
                        blockStyleFn={getBlockStyle}
                        customStyleMap={styleMap}
                        editorState={editorState}
                        handleKeyCommand={this.handleKeyCommand}
                        onChange={this.onChange}
                        placeholder="Tell a story..."
                        ref="editor"
                        spellCheck={true}
                    />
                </div>

            </div>

        );
    }
}

// class RichEditorExampleText extends React.Component {
//
//     constructor(props) {
//
//         super(props);
//         this.state = {}
//         const content = null
//         //const content = window.localStorage.getItem("content" + this.itsCounter);
//         if (content) {
//             this.state.editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(content)));
//         } else {
//             this.state.editorState = EditorState.createEmpty();
//         }
//         this.focus = () => this.refs.editor.focus();
//         this.onChange = (editorState) => this.setState({editorState});
//
//         this.handleKeyCommand = (command) => this._handleKeyCommand(command);
//         this.toggleBlockType = (type) => this._toggleBlockType(type);
//         this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
//     }
//
//     _handleKeyCommand(command) {
//         const {editorState} = this.state;
//         const newState = RichUtils.handleKeyCommand(editorState, command);
//         if (newState) {
//             this.onChange(newState);
//             return true;
//         }
//         return false;
//     }
//
//     _toggleBlockType(blockType) {
//         this.onChange(
//             RichUtils.toggleBlockType(
//                 this.state.editorState,
//                 blockType
//             )
//         );
//     }
//
//     _toggleInlineStyle(inlineStyle) {
//         this.onChange(
//             RichUtils.toggleInlineStyle(
//                 this.state.editorState,
//                 inlineStyle
//             )
//         );
//     }
//
//     onChange = (editorState) => {
//         const contentState = editorState.getCurrentContent();
//         console.log('content state', convertToRaw(contentState));
//         this.setState({
//             editorState,
//         });
//     }
//
//     render() {
//         const {editorState} = this.state;
//
//         // If the user changes block type before entering any text, we can
//         // either style the placeholder or hide it. Let's just hide it now.
//         let className = 'RichEditor-editor';
//         let classNameText = 'RichEditor-editor-Text';
//         var contentState = editorState.getCurrentContent();
//         console.log('content state', convertToRaw(contentState));
//         if (!contentState.hasText()) {
//             if (contentState.getBlockMap().first().getType() !== 'unstyled') {
//                 className += ' RichEditor-hidePlaceholder';
//             }
//         }
//         return (
//             <div className="RichEditor-root">
//                 <div className="RichEditor-editor RichEditor-editor-Text" onClick={this.focus}>
//                     <Editor
//                         blockStyleFn={getBlockStyle}
//                         customStyleMap={styleMap}
//                         editorState={editorState}
//                         handleKeyCommand={this.handleKeyCommand}
//                         onChange={this.onChange}
//                         onTab={this.onTab}
//                         spellCheck={true}
//                     />
//                 </div>
//             </div>
//         );
//     }
// }


// Custom overrides for "code" style.
const styleMap = {
    CODE: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
        fontSize: 16,
        padding: 2,
    },
};

function getBlockStyle(block) {
    switch (block.getType()) {
        case 'blockquote':
            return 'RichEditor-blockquote';
        default:
            return null;
    }
}

class StyleButton extends React.Component {
    constructor(props) {
        super(props);
        this.onToggle = (e) => {
            e.preventDefault();
            this.props.onToggle(this.props.style);
        };
    }

    render() {
        let className = 'RichEditor-styleButton';
        if (this.props.active) {
            className += ' RichEditor-activeButton';
        }

        return (
            <span className={className} onMouseDown={this.onToggle}>
              {this.props.label}
            </span>
        );
    }
}

const BLOCK_TYPES = [
    {label: 'H1', style: 'header-one'},
    {label: 'H2', style: 'header-two'},
    {label: 'H3', style: 'header-three'},
    {label: 'H4', style: 'header-four'},
    {label: 'H5', style: 'header-five'},
    {label: 'H6', style: 'header-six'},
    {label: 'Blockquote', style: 'blockquote'},
    {label: 'UL', style: 'unordered-list-item'},
    {label: 'OL', style: 'ordered-list-item'},
    {label: 'Code Block', style: 'code-block'},
];

const BlockStyleControls = (props) => {
    const {editorState} = props;
    const selection = editorState.getSelection();
    const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();

    return (
        <div className="RichEditor-controls">
            {BLOCK_TYPES.map((type) =>
                <StyleButton
                    key={type.label}
                    active={type.style === blockType}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            )}
        </div>
    );
};

const INLINE_STYLES = [
    {label: 'Bold', style: 'BOLD'},
    {label: 'Italic', style: 'ITALIC'},
    {label: 'Underline', style: 'UNDERLINE'},
    {label: 'Monospace', style: 'CODE'},
];

const InlineStyleControls = (props) => {
    const currentStyle = props.editorState.getCurrentInlineStyle();
    return (
        <div className="RichEditor-controls">
            {INLINE_STYLES.map(type =>
                <StyleButton
                    key={type.label}
                    active={currentStyle.has(type.style)}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            )}
        </div>
    );
};
