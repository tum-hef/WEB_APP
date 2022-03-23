import MainMenu from '../components/MainMenu'
import SmallInfoTag from '../components/SmallInfoTag'

import { useKeycloak } from '@react-keycloak/web'
import PropTypes from 'prop-types'
import { MainContainer, MainMenuContainer, TagContainer } from '../styles/Dashboard.styles'

const Dashboard = (props: any) => {
    const { keycloak } = useKeycloak()

    return (
        <MainContainer>
            <MainMenuContainer>
                <MainMenu />
            </MainMenuContainer>
                <SmallInfoTag name="Devices" link="/devices" icon="BsFillMusicPlayerFill"/>
                <SmallInfoTag name="Server" link="/servers" icon="BsFillInboxesFill"/>
                <SmallInfoTag name="Notifications" link="/notifications" icon="BsFillChatRightDotsFill"/>
                <SmallInfoTag name="Reports" link="/reports" icon="BsFillExclamationTriangleFill"/>
        </MainContainer>
    )
}

Dashboard.propTypes = {
    classes: PropTypes.object.isRequired,
  };

export default Dashboard;