import React from 'react'
import styled from 'styled-components'

const GroupWrapper = styled.div`
  transition: all 0.2s ease;
  background-color: ${props => props.expanded ? 'rgba(40,40,40, 0.6);' : 'rgba(40,40,40, 0.3);'};
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
  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */  
`

const Chevron = styled.span`
  display: inline-block;
  color: #666;
  margin-right: 0.5rem;
`

const Group = ({ name, expanded, onExpandToggle, children }) => (
  <GroupWrapper expanded={expanded}>
    <GroupName onClick={() => onExpandToggle(name)}>
      <Chevron className={`fa fa-chevron-${expanded ? 'up' : 'down'}`}></Chevron> {name}
    </GroupName>
    {
      expanded && <div>{children}</div>
    }
  </GroupWrapper>
)

export default Group
