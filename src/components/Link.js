import React from 'react'
import styled from 'styled-components'

const Row = styled.div`
  margin-bottom: 0.5rem;
`

function Link({url, name, description}) {
  return (
    <Row>
      <p><a href={url} target="_blank">{name}</a> {description}</p>
    </Row>
  )
}

export default Link
