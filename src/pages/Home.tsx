import { useCallback } from 'react'
import { Redirect, useLocation } from 'react-router-dom'
import Button from '@mui/material/Button'

import { useKeycloak } from '@react-keycloak/web'

import { Wrapper, LoginContainer, LogoContainer } from '../styles/Home.styles'

const HomePage = () => {
    const location = useLocation<{ [key: string]: unknown }>()
    const currentLocationState = location.state || {
        from: { pathname: '/dashboard' },
    }

    const { keycloak } = useKeycloak()

    const login = useCallback(() => {
        keycloak?.login()
    }, [keycloak])

    if (keycloak?.authenticated){

        console.log("Logged out")
        return <Redirect to={currentLocationState?.from as string} />
    }

    return (
        <Wrapper>
            <LogoContainer>
                <img src={require('../resources/tum.png')} alt="" />
                <p>Hans Eisenmann Forum für Agrarwissenschaften</p>
            </LogoContainer>
            <LoginContainer>
                <Button variant="contained" onClick={login}>Login</Button>
            </LoginContainer>
        </Wrapper>
    )
}

export default HomePage