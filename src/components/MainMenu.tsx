import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { useKeycloak } from '@react-keycloak/web'
import IUserInfo from '../models/keycloak/UserInfo'
import { Link } from 'react-router-dom'

const styles = {
    mainContainer: {
        height: '960px',
        width: '400px',
        backgroundColor: '#C4C4C4',
        marginTop: '-20px',
        marginLeft: '-7px',
    },
    descriptionContainer: {
        width: '80%',
        height: '300px',
        borderBottom: '1px solid grey',
        marginLeft: '10%'
    },
    linkContainer: {
        width: '80%',
        height: '400px',
        marginTop: '10%',
        marginLeft: '10%',
        borderBottom: '1px solid grey',
    },
    link: {

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
            <div className={classes.linkContainer}>
                <div>
                    <Link to='/dashboard'>Dashboard</Link> 
                </div>
                <div>
                    <Link to='/servers'>Servers</Link>
                </div>
            </div>
        </div>
    )
}

MainMenu.propTypes = {
    classes: PropTypes.object.isRequired,
  };

export default withStyles(styles)(MainMenu)