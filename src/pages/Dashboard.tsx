import MainMenu from '../components/MainMenu'

import { useKeycloak } from '@react-keycloak/web'

const Dashboard = () => {

    const { keycloak } = useKeycloak()

    return (
        <div>
            {!!keycloak?.authenticated && (
                <button type="button" onClick={() => keycloak.logout()}>
                    Logout
                </button>
            )}
        </div>
    )
}

export default Dashboard