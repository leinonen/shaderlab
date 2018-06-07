import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/glsl';
import 'brace/theme/gruvbox';
import { selectEditor } from '../store/selectors';
import { setEditorSource } from '../store/editor/actions'

// https://www.npmjs.com/package/brace
// https://github.com/securingsincity/react-ace/blob/master/docs/Ace.md

const Editor = (props) => (
  <AceEditor
    {...props}
    name="editor"
    mode="glsl"
    theme="gruvbox"
    tabSize={2}
    showPrintMargin={false}
    editorProps={{ $blockScrolling: Infinity }}
    onChange={props.setEditorSource}
    value={props.editor.editorSource}
    focus
  />
)

const mapStateToProps = createSelector(
  selectEditor,
  (editor) => ({ editor })
)

const mapDispatchToProps = {
  setEditorSource
}

export default connect(mapStateToProps, mapDispatchToProps)(Editor)
