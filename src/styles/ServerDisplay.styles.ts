import styled from "styled-components";
import { Colors } from "./Colors";

const Wrapper = styled.div`
    height: 2000px;
    width: 100%;
    display: flex;
    margin-top: -10px; 
    margin-right: -10px;
    background-color: ${Colors.background}
`;

const MainContentContainer = styled.div`
    width: 100%;
`;

const ChartContainer = styled.div`
    width: 60%;
    margin-top: 5%;
    margin-left: 5%;
`;

export { Wrapper, MainContentContainer, ChartContainer }