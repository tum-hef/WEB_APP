import { useCallback } from 'react'
import { Redirect, useLocation } from 'react-router-dom'

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

    if (keycloak?.authenticated)
    return <Redirect to={currentLocationState?.from as string} />

    return (
        <Wrapper>
            <LoginContainer>
                <h1>Home</h1>
            </LoginContainer>
            <LoginContainer>
                <button type="button" onClick={login}>
                    Login
                </button>
            </LoginContainer>
        </Wrapper>
    )
}

export default HomePage