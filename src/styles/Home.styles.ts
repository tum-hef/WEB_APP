import styled from "styled-components";
import { Colors } from "./Colors";

const Wrapper = styled.div`
    display: flex;
    width: 100%;
    height: 950px;
    background-color: ${Colors.background};
    justify-content: center;
    align-items: center;
    border-right: 1px solid ${Colors.MenuIcon};
`;

const LogoContainer = styled.div`
    margin-right: 100px;
    color: #0065BD;
    display: flex;
    flex-direction: column;
`;

const LoginContainer = styled.div`
`;

export { Wrapper, LoginContainer, LogoContainer
 }