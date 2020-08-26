import * as React from "react";
import styled from "styled-components";

const StyledDiv = styled.div`
  background: #ebebeb;
  box-shadow: 20px 20px 60px #c8c8c8, -20px -20px 60px #ffffff;
`;

export const Hello = () => <StyledDiv>hello world foo</StyledDiv>;
