import MainMenu from '../components/MainMenu'
import { useKeycloak } from '@react-keycloak/web'

const Dashboard = () => {
    const { keycloak } = useKeycloak()

    return (
        <div>
            <MainMenu />
        </div>
    )
}

export default Dashboard