import React from 'react';
import styled from 'styled-components'

import Menu from './Menu'
import Button from './Button'

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  & > button {
    flex: 0 0 auto;
    flex-wrap: nowrap;
    margin-right: 1rem;
    margin-top: 1rem;
  }
`

const Config = ({ expanded, scaling, scale1x, scale2x, scale4x }) => {
  return (
    <Menu expanded={expanded}>
      <ButtonWrapper>
        <Button active={scaling === 1.0} onClick={scale1x}>1/1 Scaling</Button>
        <Button active={scaling === 0.5} onClick={scale2x}>1/2 Scaling</Button>
        <Button active={scaling === 0.25} onClick={scale4x}>1/4 Scaling</Button>
      </ButtonWrapper>
    </Menu>
  );
};

export default Config;
