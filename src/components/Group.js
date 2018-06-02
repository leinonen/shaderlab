import React from 'react'
import styled from 'styled-components'

const GroupWrapper = styled.div`
  background-color: rgba(40,40,40, 0.4);
  box-sizing: border-box;
  padding: 1rem;
  margin-bottom: 2rem;
`

const GroupName = styled.h2`
  margin: 0.5rem 0;
  cursor: pointer;
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
