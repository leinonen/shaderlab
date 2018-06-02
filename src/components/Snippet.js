import React from 'react'
import styled from 'styled-components'

const Row = styled.div`
  margin-bottom: 0.5rem;
`
// https://www.w3schools.com/howto/howto_js_copy_clipboard.asp
function Snippet({ name, source }) {
  return (
    <Row>
      <h3>{name}</h3>
      <pre style={{ padding: '0.5rem' }}>{source}</pre>
    </Row>
  )
}

export default Snippet
