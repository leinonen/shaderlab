import React from 'react'
import styled from 'styled-components'

const GroupWrapper = styled.div`
  background-color: rgba(40,40,40, 0.4);
  box-sizing: border-box;
  padding: 1rem;
  margin-bottom: 1rem;
  p {
    color: #777;
  }
`

const GroupName = styled.h2`
  margin: 0;
  cursor: pointer;
  font-size: 1.2rem;
`

const Group = ({ name, expanded, onExpandToggle, children }) => (
  <GroupWrapper>
    <GroupName onClick={() => onExpandToggle(name)}>
      <span className={`fa fa-chevron-${expanded ? 'up' : 'down'}`}></span> {name}
    </GroupName>
    {
      expanded && <div>{children}</div>
    }
  </GroupWrapper>
)

export default Group
