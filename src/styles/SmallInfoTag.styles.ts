import styled from "styled-components";
import { Colors } from "./Colors";

const Wrapper = styled.div`
    background-color: ${Colors.main};
    height: 120px;
    width: 400px;
    display: flex;
    justify-conten: center;
    align-items: center;
    margin: 10px;
    border-radius: 5px;
`;

const InfoContainer = styled.div`
   color: white;
   font-family: Helvetica;
`;



export { Wrapper, InfoContainer }
