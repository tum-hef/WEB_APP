import styled from "styled-components";
import { Colors } from "./Colors";

const MainContainer = styled.div`
    height: 2000px;
    width: 100%;
    display: flex;
    margin-top: -10px; 
    margin-right: -10px;
    background-color: ${Colors.background}
`;

const MainContentContainer = styled.div`
    width: 100%;
`

const CardContainer = styled.div`
    width: 100%;
    margin-left: 4%;
`;

export { MainContainer, MainContentContainer, CardContainer }