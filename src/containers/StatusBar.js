import React from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import pkgJson from '../../package.json'
import { selectEditor } from '../store/selectors';

const StatusBarWrapper = styled.div`
  position: absolute;
  z-index: 4;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${props => props.error === true ? 'rgba(50,10,10, 0.9)' : 'rgba(10,10,10, 0.9)'};
  color: ${props => props.error === true ? 'yellow' : 'rgb(200, 255, 0)'};;
  padding: 0.5em;
  box-sizing: border-box;
  font-size: 0.7em;
  min-height: 2em;
  display: flex;
  flex-wrap: nowrap;
  @media screen and (max-width: 768px) {
  display: none; 
  }
`

const Message = styled.div`
  flex: 1 1 70%;
`

const Credz = styled.div`
  flex: 1 1 30%;
  text-align: right;
  a, a:active, a:visited {
    color: white;
  }
`

const StatusBar = (props) => {
  const { editor } = props
  const { name, version, author } = pkgJson
  return (
    <StatusBarWrapper {...props} error={editor.compileSuccess === false}>
      <Message>{editor.compileMessage}</Message>
      <Credz>{name}/{version} by <a href="http://leinonen.se">{author}</a></Credz>
    </StatusBarWrapper>
  )
}

const mapStateToProps = createSelector(
  selectEditor,
  (editor) => ({ editor })
)

export default connect(mapStateToProps, null)(StatusBar)
