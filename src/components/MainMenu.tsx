import { useKeycloak } from '@react-keycloak/web'
import IUserInfo from '../models/keycloak/UserInfo'
import { Link } from 'react-router-dom'
import { MainContainer, DescriptionContainer, LinkContainer, StyledLink, SectionContainer, UserNameContainer } from '../styles/MainMenu.styles'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSliders, faServer, faUser } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@mui/material'
const MainMenu = (props: any) => {
    const { keycloak } = useKeycloak()
    const userInfo = keycloak.idTokenParsed as IUserInfo
    
    return (
        <MainContainer>
            <DescriptionContainer>
                <UserNameContainer>
                    <div>
                        <FontAwesomeIcon icon={faUser} size={'2x'} />
                    </div>
                    <div>
                        <p>{userInfo.preferred_username}</p>
                    </div>
                </UserNameContainer>
            </DescriptionContainer>
            <SectionContainer>
                <p>Pages</p>
            </SectionContainer>
            <LinkContainer>
                <StyledLink>
                    <div>
                        <FontAwesomeIcon icon={faSliders} />
                    </div>
                    <div>
                        <Link to='/dashboard'>Dashboard</Link>
                    </div>
                </StyledLink>
                <StyledLink>
                    <div>
                        <FontAwesomeIcon icon={faServer} />
                    </div>
                    <div>
                        <Link to='/servers'>Server</Link>
                    </div>
                </StyledLink>
                   <StyledLink>
                    <div>
                        <FontAwesomeIcon icon={faServer} />
                    </div>
                    <div>
                        <a href="http://localhost:8080/realms/keycloak-react-auth/protocol/openid-connect/logout">

                        Logout </a>
                    </div>
                </StyledLink>
             
            </LinkContainer>
        </MainContainer>
    )
}

export default MainMenu