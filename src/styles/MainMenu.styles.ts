import styled from "styled-components";
import { Colors } from "./Colors";

const MainContainer = styled.div`
    height: 100%;
    width: 300px;
    background-color: ${Colors.main};
    margin-left: -10px;
`;

const DescriptionContainer = styled.div`
    width: 80%;
    height: 150px;
`;

const UserNameContainer = styled.div`
    width: 100%;
    height: 100px;
    margin-top: 10%;
    display: flex;
    align-items: center;
    justify-content: center;

    p {
        font-size: 30px;
        color: white;
    }

    path {
        color: ${Colors.lightblue};
        font-size: 30px;
    }

    div {
        margin-left: 20px;
    }
`;

const SectionContainer = styled.div`
    width: 80%;
    margin-left: 10%;

    p {
        color: ${Colors.MenuIcon}
    }
`;

const LinkContainer = styled.div`
    width: 100%;
    height: 400px;
    margin-top: 10%;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const StyledLink = styled.div`
    height: 15%;
    width: 100%;
    margin-bottom: 10%;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    div {
        margin-left: 30px;
    }

    a {
        color: ${Colors.MenuIcon};
        width: 80%;
        height: 20%;
        text-decoration: none;
        font-size: 25px;
    }

    path {
        color: ${Colors.MenuIcon};
    }

    &:hover {
        background-color: ${Colors.activeLink};
    }
`


export { MainContainer, DescriptionContainer, LinkContainer, StyledLink, SectionContainer, UserNameContainer }