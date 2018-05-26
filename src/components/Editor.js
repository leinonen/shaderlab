import React, { Component } from 'react'

import brace from 'brace';
import AceEditor from 'react-ace';

import 'brace/mode/glsl';
import 'brace/theme/gruvbox';

// https://www.npmjs.com/package/brace
// https://github.com/securingsincity/react-ace/blob/master/docs/Ace.md

export default class Editor extends Component {
  render() {
    return <AceEditor {...this.props}
      name="editor"
      mode="glsl"
      theme="gruvbox"
      tabSize={2}
      showPrintMargin={false}
      editorProps={{ $blockScrolling: Infinity }}
    />
  }
}
