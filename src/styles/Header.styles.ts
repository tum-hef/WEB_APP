import styled from "styled-components";
import { Colors } from "./Colors";

const Wrapper = styled.div`
    height: 10%;
    display: flex;
    background-color: ${Colors.background};
    position: fixed;
    justify-content: center;
    align-items: center;
`;

const SearchContainer = styled.div`
`;


/** Hardcoded Styling for Menu in Header */
const MenuContainer = styled.div`
    margin-left: 1500px;
`;

export { Wrapper, SearchContainer, MenuContainer }