import { useCallback } from 'react'
import { Redirect, useLocation } from 'react-router-dom'

import { useKeycloak } from '@react-keycloak/web'

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
        <div>
            <h1>Home Page</h1>
            <button type="button" onClick={login}>
                Login
            </button>
        </div>
    )
}

export default HomePage