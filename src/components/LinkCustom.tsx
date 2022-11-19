// styled component Link MUI react

import { Link } from "react-router-dom";
import styled from "styled-components";

const LinkCustom = styled(Link)`
    text-decoration: none;
    color: inherit;
    &:hover {
        text-decoration: none;
        color: #1976D2;
    }
`;

export default LinkCustom;