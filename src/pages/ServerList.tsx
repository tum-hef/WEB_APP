import { useKeycloak } from '@react-keycloak/web'

const ServerList = () => {
    const { keycloak } = useKeycloak()

    return (
        <div>
            <h1>Lists all Servers</h1>
        </div>
    )
}

export default ServerList