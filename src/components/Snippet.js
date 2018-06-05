import React, { Component } from 'react'
import styled from 'styled-components'
import Button from './Button'

const Row = styled.div`
  margin-bottom: 0.5rem;
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  color: white;
  background-color: #333;
  border: none;
  resize: none;
`
// https://www.w3schools.com/howto/howto_js_copy_clipboard.asp

class Snippet extends Component {
  constructor(props) {
    super(props)
    this.copy = this.copy.bind(this)
    this.state = {
      msg: 'Copy'
    }
  }

  copy() {
    this.textRef.select()
    document.execCommand("copy");
    this.setState({ msg: 'Copied to clipboard' })
    setTimeout(() => {
      this.setState({ msg: 'Copy' })
    }, 1000);
  }

  render() {
    const { name, source } = this.props
    const rows = source.split('\n').length + 1
    return (
      <Row>
        <h3>{name}</h3>
        <Button onClick={this.copy}>{this.state.msg}</Button>
        <TextArea
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          rows={rows}
          innerRef={(node) => this.textRef = node}
          defaultValue={source}></TextArea>
      </Row>
    )
  }
}

export default Snippet
