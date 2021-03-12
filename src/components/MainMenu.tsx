import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { useKeycloak } from '@react-keycloak/web'
import IUserInfo from '../models/keycloak/UserInfo'
import CustomLink from './Link'

const styles = {
    mainContainer: {
        height: '960px',
        width: '400px',
        backgroundColor: '#C4C4C4',
        marginTop: '-20px',
        marginLeft: '-7px',
        display: 'flex',
        justifyContent: 'flex-start',
    },
    descriptionContainer: {
        width: '400px',
        height: '400px',
        borderBottom: '1px solid grey'
    }
}

const MainMenu = (props: any) => {
    const { classes } = props;
    const { keycloak } = useKeycloak()
    const userInfo = keycloak.idTokenParsed as IUserInfo

    return (
        <div className={classes.mainContainer}>
            <div className={classes.descriptionContainer}>
                <h1>{userInfo.preferred_username}</h1>
            </div>
        </div>
    )
}

MainMenu.propTypes = {
    classes: PropTypes.object.isRequired,
  };

export default withStyles(styles)(MainMenu)