import styled from "styled-components";
import { Colors } from "./Colors";

const MainContainer = styled.div`
    height: 2000px;
    width: 100%;
    display: flex;
    background-color: ${Colors.background};
    margin-top: -10px; 
`;

const MainMenuContainer = styled.div`
    margin-right: 20px;
    display: flex;
`;

const TagContainer = styled.div`
    width: 100%;
    display: flex;
`;

export { MainContainer, MainMenuContainer, TagContainer}