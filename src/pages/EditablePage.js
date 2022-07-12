import React, {Component} from "react";
import {child, get, ref, set, update} from "firebase/database";
import {rtDatabase} from "../Firebase";
import {convertFromRaw, convertToRaw, Editor, EditorState, RichUtils} from "draft-js";
import draftToHtml from 'draftjs-to-html';


/**
 * EditablePage & Infobox by Katharina Zirkler
 * RichEditor by Tim Finmans
 * */

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


export class EditablePage extends Component {
    /**
     * This class serves as a wrapper for pages implementing an edit feature.
     * Content is stored in the specified database
     * */

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
    }

    componentDidMount() {
        this.fetchContent()
    }

    fetchContent() {
        /**
         * fetches the current database content of this page's table
         * if successful, updates this state with fetched data
         */
        get(child(ref(rtDatabase), this.path)).then((snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach(node => {
                    let _node = new Object(node.val())
                    _node['content'] = convertFromRaw(JSON.parse(node.val()['content']))
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
            console.log(error)
        });
    }

    toggleEditMode() {
        /**
         * Switches between the read- and editmode of the page
         * and resets the disablement of the submit button
         * */
        this.setState({
            editMode: !this.state.editMode,
            submitDisabled: true,
        });
    }

    handleSubmit() {
        /**
         * Arranges changes and deletions pre-submitted from the content boxes and
         * stores them in the database, then updates local state
         * */

        if (Object.keys(this.state.toBeWrittenToDB).length !== 0 || this.state.toBeDeletedFromDB.length !== 0) {

            // 1. setstate CoB w/ tbwDB
            try {
                let tempMap = {}
                Object.entries(this.state.contentOfBoxes).map(([key, value]) => {
                    // console.log("content", value)
                    tempMap[key] = value

                    // console.log("tempmap nach content", tempMap)
                })
                Object.entries(this.state.toBeWrittenToDB).map(([key, value]) => {
                    // console.log("tobewritten", value)
                    tempMap[key] = value
                })
                // console.log("1. tempmap: ", tempMap)

                // 2. delete tbd boxes in state
                let tempMap2 = {}
                Object.entries(tempMap).map(([key, value]) => {
                    if (this.state.toBeDeletedFromDB.indexOf(key) === -1) {
                        tempMap2[key] = value
                    }
                })
                // console.log("2. tempmap2: ", tempMap2)

                // 3. update content order in state CoB (taking out blank positions)
                Object.entries(tempMap2)
                    .sort((a, b) => a[1]["position"] - b[1]["position"])
                    .forEach(([key, value], index) => {
                        if (value["position"] !== (index + 1)) {
                            value["position"] = (index + 1)
                        }
                    })
                // console.log("3. tempmap2: ", tempMap2)


                // 4. Converting ContentState to raw String

                // console.log("4. dazwischen tempmap2: ", tempMap2)

                Object.entries(tempMap2).forEach(([key, val]) => {
                    let temp = {...val}
                    // console.log("4. in tempmap2 val", val)
                    if ((typeof val.content !== 'string')) {
                        temp.content = JSON.stringify(convertToRaw(val.content))
                        tempMap2[key].content = temp.content
                    }
                })
                // console.log("4. nacher tempmap2: ", tempMap2)

                // 5. update content in DB
                set(ref(rtDatabase, this.path), tempMap2).then(() => {
                    this.setState({
                        toBeWrittenToDB: {},
                        toBeDeletedFromDB: [],
                    })
                    this.fetchContent()
                    this.toggleEditMode()
                })
            } catch (e) {
                console.log(e)
            }
        } else {
            this.toggleEditMode()
        }
    }

    abortChanges() {
        /**
         * Resets pre-submitted changes and leaves edit-mode
         * */
        this.setState({
            toBeWrittenToDB: {},
            toBeDeletedFromDB: [],
        })
        this.toggleEditMode()
    }

    checkIfNodeExists(position) {
        /**
         * checks if a node already exists within the database for a calculated key,
         * if it does exist, it tries the following number to calculate a new key and tries this,
         * until it finds an empty position in the database
         * */

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
                console.log(e)
            }
        })
    }

    addToDB() {
        /**
         * submits the content of a newly added content boxes to the database
         * with exemplary text that already has an editorstate-like format
         * */


        try {
            let _position = this.state.listOfKeys.length + 1
            this.checkIfNodeExists(_position).then((pos) => {
                const _path = "content" + pos.toString()
                const _key1 = "abc" + pos.toString()
                const _key2 = "def" + pos.toString()
                const _value = {
                    "content": '{"blocks":[{"key":"' + _key1 + '","text":"Hier kannst du deinen Inhalt einfügen' +
                        ' und anpassen. Abhängig davon ob du einen Titel vergibst oder nicht, wird das Logo der' +
                        ' Fra-UAS automatisch eingefügt.","type":"unstyled","depth":0,"inlineStyleRanges":[],' +
                        '"entityRanges":[],"data":{}},{"key":"' + _key2 + '","text":"Falls du diese Box doch nicht' +
                        ' benötigst, kannst du sie mit dem Mülleimer wieder zum löschen freigeben.","type":"unstyled",' +
                        '"depth":0,"inlineStyleRanges":[],"entityRanges":[],"data":{}}],"entityMap":{}}',
                    "title": "Titel",
                    "position": pos
                }
                set(ref(rtDatabase, this.path + _path), _value).then(() => {
                    let tempMap = {...this.state.contentOfBoxes}
                    let temp = {..._value}
                    temp.content = convertFromRaw(JSON.parse(_value.content))
                    tempMap[_path] = temp
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
            console.log(e)
        }
    }

    swapPosition(upperKey) {
        /**
         * Switches the position of the content boxes above and below the triggering button
         * and stores those changes in the database
         * */

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

            let tempStateLocal = {}
            let tempStateDB = {}
            tempList.forEach(([key, val]) => {
                // console.log(val.content)
                let temp = {...val}
                // console.log(temp.content)
                tempStateLocal[key] = temp
            })
            tempList.forEach(([key, val]) => {
                let temp = {...val}
                temp.content = JSON.stringify(convertToRaw(val.content))
                tempStateDB[key] = val
                tempStateDB[key].content = temp.content
            })
            // console.log("tempDB: ", tempStateDB)
            // console.log("tempLocal: ", tempStateLocal)
            update(ref(rtDatabase, this.path), tempStateDB).then(r => {
                this.setState({
                    contentOfBoxes: tempStateLocal
                })
            })

        } catch
            (e) {
            console.log(e)
        }
    }

    receiveChildData(node) {
        /**
         *  Updates this Component's state with data prepared by the content boxes
         *  */
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
            console.log(e)
        }
    }


    render() {

        const editToggled = this.state.editMode
        let listOfInfoboxes = []
        // prepares a list alternating between an Infobox element and an icon button to
        // switch box positions, ended by an icon button to add a new Infobox element
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

    /**
     * Depending on a boolean regarding the edit mode of the base page, this class is responsible
     * for either showing the desired text as read-only or several input possibilities to manipulate the content.
     * */

    constructor(props) {
        super(props);
        this.state = {
            _title: "",
            _content: "",
            body: "",
            deleteCheck: false,
            sentCheck: false
        };
        this.handleInputChange = this.handleInputChange.bind(this)
        this.sendDataToParent = this.sendDataToParent.bind(this)
        this.deleteThis = this.deleteThis.bind(this)
        this.receiveEditorState = this.receiveEditorState.bind(this)
    }

    componentDidMount() {
        const _body = this.convertToHTML()
        this.setState({
            _title: this.props.title,
            _content: this.props.content,
            body: _body
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.content !== prevProps.content) {
            const _body = this.convertToHTML()
            this.setState({
                _title: this.props.title,
                _content: this.props.content,
                body: _body,
            })
        }
        if (this.props.toggle !== prevProps.toggle) {
            const _body = this.convertToHTML()
            this.setState({
                _title: this.props.title,
                _content: this.props.content,
                body: _body,
                deleteCheck: false,
                sentCheck: false
            })
        }
    }

    sendDataToParent() {
        /**
         * passes the data that is to be submitted
         * to the database up to the parent
         * */

        try {
            let node = {
                "content": this.state._content,
                "title": this.state._title,
                "position": this.props.position
            }
            this.props.submitData({[this.props.path]: node})
        } catch (e) {
            console.log(e)
        }
    }

    deleteThis() {
        /**
         * Changes the state to be recognized as to be deleted
         * */
        this.setState({
            _content: "",
            _title: "",
            deleteCheck: true,
            sentCheck: false
        }, () => this.sendDataToParent())

    }

    handleInputChange(event) {
        /**
         * default input handler
         * taken from https://reactjs.org/docs/forms.html - Handling Multiple Inputs
         * */

        event.preventDefault()
        const target = event.target;
        const value = target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    receiveEditorState(es) {
        /**
         * Changes local state from editorstate passed by RichEditor
         * */

        this.setState({
            editorstate: es,
            _content: JSON.stringify(convertToRaw(es.getCurrentContent())),
        })
    }

    convertToHTML() {
        /**
         * Converts ContentState Object to HTML
         * */
        try {
            console.log(draftToHtml(convertToRaw(this.props.content)))

            return <div dangerouslySetInnerHTML={{__html: draftToHtml(convertToRaw(this.props.content))}}></div>
        } catch (e) {
            console.log(e)
        }
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
                            <RichEditor
                                value={this.props.content}
                                submit={this.receiveEditorState}>
                            </RichEditor>
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
                            <div className="text editable-p">{this.state.body}</div>
                        </div> :
                        <div>
                            <div className="text editable">{this.state.body}</div>
                        </div>}
            </div>

        );

    }
}

// editor similar to https://codepen.io/AvanthikaMeenakshi/pen/MWWpOJz
class RichEditor extends React.Component {

    constructor(props) {
        super(props);
        try {

            console.log(props.value)
            this.state = {
                editorState: EditorState.createWithContent(props.value),
                showURLInput: false,
                urlValue: '',
            }
        } catch (e) {
            console.log(e)
            this.state = {
                editorState: EditorState.createEmpty(),
                showURLInput: false,
                urlValue: '',
            }
        }

        this.focus = () => this.refs.editor.focus();
        this.onChange = (editorState) => {
            this.setState({editorState})
            this.props.submit(editorState)
        };

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
        this.setState({
            editorState,
        })
    }

    // main URL part is from this website https://codesandbox.io/s/nz8fj?file=/src/index.js
    onURLChange = (e) => this.setState({urlValue: e.target.value});

    promptForLink = (e) => {
        e.preventDefault();
        const {editorState} = this.state;
        const selection = editorState.getSelection();
        if (!selection.isCollapsed()) {
            const contentState = editorState.getCurrentContent();
            const startKey = editorState.getSelection().getStartKey();
            const startOffset = editorState.getSelection().getStartOffset();
            const blockWithLinkAtBeginning = contentState.getBlockForKey(startKey);
            const linkKey = blockWithLinkAtBeginning.getEntityAt(startOffset);
            let url = '';
            if (linkKey) {
                const linkInstance = contentState.getEntity(linkKey);
                url = linkInstance.getData().url;
            }
            this.setState({
                showURLInput: true,
                urlValue: url,
            }, () => {
                setTimeout(() => this.refs.url.focus(), 0);
            });
        }
    }


    confirmLink = (e) => {
        e.preventDefault();
        const {editorState, urlValue} = this.state;
        const contentState = editorState.getCurrentContent();

        const contentStateWithEntity = contentState.createEntity(
            'LINK',
            'MUTABLE',
            {url: urlValue}
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

        if (urlValue === "") {
            this.refs.editor.focus()
            this.setState({
                showURLInput: false,
            })
            return;
        }

        // Apply entity
        let nextEditorState = EditorState.set(editorState,
            {currentContent: contentStateWithEntity}
        );

        // Apply selection
        nextEditorState = RichUtils.toggleLink(nextEditorState,
            nextEditorState.getSelection(), entityKey
        );

        this.setState({
            editorState: nextEditorState,
            showURLInput: false,
            urlValue: '',
        }, () => {
            setTimeout(() => this.refs.editor.focus(), 0);
        });
    }

    onLinkInputKeyDown = (e) => {
        if (e.which === 13) {
            this.confirmLink(e);
        }
    }

    removeLink = (e) => {
        e.preventDefault();
        const {editorState} = this.state;
        const selection = editorState.getSelection();
        if (!selection.isCollapsed()) {
            this.setState({
                editorState: RichUtils.toggleLink(editorState, selection, null),
            });
        }
    }

    render() {
        const {editorState, showURLInput} = this.state;

        // If the user changes block type before entering any text, we can
        // either style the placeholder or hide it. Let's just hide it now.
        let className = 'RichEditor-editor';
        const contentState = editorState.getCurrentContent();
        if (!contentState.hasText()) {
            if (contentState.getBlockMap().first().getType() !== 'unstyled') {
                className += ' RichEditor-hidePlaceholder';
            }
        }
        let urlInput;
        if (showURLInput) {
            urlInput =
                <div>
                    <input
                        onChange={this.onURLChange}
                        ref="url"
                        type="text"
                        value={this.state.urlValue}
                        onKeyDown={this.onLinkInputKeyDown}
                    />
                    <button onMouseDown={this.confirmLink}> Confirm</button>
                </div>;
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
                <span
                    className='RichEditor-styleButton'
                    onMouseDown={this.promptForLink}
                    style={{marginRight: 10}}>
                    Add Link
                </span>
                <span
                    className='RichEditor-styleButton'
                    onMouseDown={this.removeLink}>
                    Remove Link
                </span>
                {urlInput}
                <div className={className}>
                    <Editor
                        onClick={this.focus}
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