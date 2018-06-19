import React, { Component } from 'react'
import styled from 'styled-components'
import Button from './Button'

const Row = styled.div`
  margin-bottom: 0.5rem;
  & > .butts {
    position: relative;
    & > button {
      position: absolute;
      right: 0.5rem;
      top: 0.5rem;
    }
  }
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  color: #777;
  background-color: rgba(0,0,0, 0.3);
  border: 1px solid rgba(0,0,0, 0.3);
  border-radius: 4px;
  resize: none;
  outline: none;
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
    this.setState({ msg: 'Copied!' })
    setTimeout(() => {
      this.setState({ msg: 'Copy' })
    }, 700);
  }

  render() {
    const { name, source } = this.props
    const rows = source.split('\n').length + 1
    return (
      <Row>
        <h3>{name}</h3>
        <div className="butts">
          <Button onClick={this.copy}>{this.state.msg}</Button>
        </div>
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
