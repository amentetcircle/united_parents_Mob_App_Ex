import React, {Component} from "react";
import {child, get, ref, set, update} from "firebase/database";
import {rtDatabase} from "../Firebase";
import {useUserAuth} from "../context/UserAuthContext";
import {convertFromRaw, convertToRaw, Editor, EditorState, RichUtils} from "draft-js";

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
                        {/*<textarea className="editable-textarea"
                                  name="_content"
                                  value={this.state._content}
                                  onChange={this.handleInputChange}>
                                </textarea>*/}
                        <RichEditorExample
                            onChange={this.handleInputChange}
                        ></RichEditorExample>
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


class RichEditorExample extends React.Component {

    constructor(props) {

        super(props);
        this.state = {}
        const content = null

        //const content = window.localStorage.getItem("content" + this.itsCounter);
        if (content) {
            this.state.editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(content)));
        } else {
            this.state.editorState = EditorState.createEmpty();
        }
        this.focus = () => this.refs.editor.focus();
        this.onChange = (editorState) => this.setState({editorState});

        this.handleKeyCommand = (command) => this._handleKeyCommand(command);
        this.toggleBlockType = (type) => this._toggleBlockType(type);
        this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
    }

    saveContent = (content) => {
        content = this.state
        //window.localStorage.setItem("content" + this.itsCounter, JSON.stringify(convertToRaw(content)));
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
        const contentState = editorState.getCurrentContent();
        console.log('content state', convertToRaw(contentState));
        this.setState({
            editorState,
        });
    }

    render() {
        const {editorState} = this.state;

        // If the user changes block type before entering any text, we can
        // either style the placeholder or hide it. Let's just hide it now.
        let className = 'RichEditor-editor';
        var contentState = editorState.getCurrentContent();
        this.saveContent(contentState);
        console.log('content state', convertToRaw(contentState));
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
                        onTab={this.onTab}
                        placeholder="Tell a story..."
                        ref="editor"
                        spellCheck={true}
                    />
                </div>
            </div>
        );
    }
}

class RichEditorExampleText extends React.Component {

    constructor(props) {

        super(props);
        this.state = {}
        const content = null
        //const content = window.localStorage.getItem("content" + this.itsCounter);
        if (content) {
            this.state.editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(content)));
        } else {
            this.state.editorState = EditorState.createEmpty();
        }
        this.focus = () => this.refs.editor.focus();
        this.onChange = (editorState) => this.setState({editorState});

        this.handleKeyCommand = (command) => this._handleKeyCommand(command);
        this.toggleBlockType = (type) => this._toggleBlockType(type);
        this.toggleInlineStyle = (style) => this._toggleInlineStyle(style);
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
        const contentState = editorState.getCurrentContent();
        console.log('content state', convertToRaw(contentState));
        this.setState({
            editorState,
        });
    }

    render() {
        const {editorState} = this.state;

        // If the user changes block type before entering any text, we can
        // either style the placeholder or hide it. Let's just hide it now.
        let className = 'RichEditor-editor';
        let classNameText = 'RichEditor-editor-Text';
        var contentState = editorState.getCurrentContent();
        console.log('content state', convertToRaw(contentState));
        if (!contentState.hasText()) {
            if (contentState.getBlockMap().first().getType() !== 'unstyled') {
                className += ' RichEditor-hidePlaceholder';
            }
        }
        return (
            <div className="RichEditor-root">
                <div className="RichEditor-editor RichEditor-editor-Text" onClick={this.focus}>
                    <Editor
                        blockStyleFn={getBlockStyle}
                        customStyleMap={styleMap}
                        editorState={editorState}
                        handleKeyCommand={this.handleKeyCommand}
                        onChange={this.onChange}
                        onTab={this.onTab}
                        spellCheck={true}
                    />
                </div>
            </div>
        );
    }
}



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
        case 'blockquote': return 'RichEditor-blockquote';
        default: return null;
    }
}

class StyleButton extends React.Component {
    constructor() {
        super();
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

var INLINE_STYLES = [
    {label: 'Bold', style: 'BOLD'},
    {label: 'Italic', style: 'ITALIC'},
    {label: 'Underline', style: 'UNDERLINE'},
    {label: 'Monospace', style: 'CODE'},
];

const InlineStyleControls = (props) => {
    var currentStyle = props.editorState.getCurrentInlineStyle();
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
