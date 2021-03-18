import MainMenu from '../components/MainMenu'
import SmallInfoTag from '../components/SmallInfoTag'

import { useKeycloak } from '@react-keycloak/web'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'


const styles = {
    mainContainer: {
        height: '100%',
        width: '100%',
        display: 'flex'
    },
    mainMenuContainer: {
        width: '40%',
        marginRight: '20px'
    },
    mainControlContainer: {
        width: '70%'
    }
}

const Dashboard = (props: any) => {
    const { keycloak } = useKeycloak()
    const { classes } = props

    return (
        <div className={classes.mainContainer}>
            <div className={classes.mainMenuContainer}>
                <MainMenu />
            </div>
            <div className={classes.mainControlContainer}>
                <SmallInfoTag />
            </div>
        </div>
    )
}

Dashboard.propTypes = {
    classes: PropTypes.object.isRequired,
  };

export default withStyles(styles)(Dashboard);