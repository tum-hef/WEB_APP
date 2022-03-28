import styled from "styled-components";
import { Colors } from "./Colors";

interface Props {
    img: string
}

const Wrapper = styled.div`
    height: 400px;
    width: 600px;
    background-color: ${Colors.main};
    margin: 20px;
    border-radius: 10px;
    font-family: 'Helvetica';
    color: white;

`;

const InfoContainer = styled.div<Props>`
    height: 60%;
    background-image: url(${props => props.img});
    border-radius: 10px 10px 0px 0px;
`;

const Header = styled.div`
    padding: 10px;
    h1 {
        font-size: 20px;
    }
`;

export { Wrapper, Header, InfoContainer }