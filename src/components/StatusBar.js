import React from 'react'
import styled from 'styled-components'

import pkgJson from '../../package.json'

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
`

const Message = styled.div`
  flex: 1 1 70%;
`

const Credz = styled.div`
  flex: 1 1 30%;
  text-align: right;
`

const StatusBar = (props) => (
  <StatusBarWrapper {...props}>
  <Message>{props.children}</Message>
  <Credz>{pkgJson.name}/{pkgJson.version} by {pkgJson.author}</Credz>
  </StatusBarWrapper>
)

export default StatusBar
