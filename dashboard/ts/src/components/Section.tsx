import * as React from "react";
import styled from "styled-components";

const StyledDiv = styled.div`
  background-color: #fff;
  border-radius: 0.25rem;
  width: 100%;
  padding: 2rem;
  margin-bottom: 2rem;

  background: #ffffff;
  box-shadow: 6px 6px 18px #e6e6e6, -6px -6px 18px #eeeeee;
`;

type Props = {};

const Section: React.FunctionComponent<Props> = ({ children }) => {
  return <StyledDiv>{children}</StyledDiv>;
};

export default Section;
