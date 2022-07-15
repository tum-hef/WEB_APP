import * as React from 'react'
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom'
import { useKeycloak } from '@react-keycloak/web'
import HomePage from '../pages/Home'
import Dashboard from '../pages/Dashboard'
import ServerList from '../pages/ServerList'
import ServerDisplay from '../pages/ServerDisplay'
import AddTTNDeviceForm from '../pages/AddTTNDeviceForm'
import { PrivateRoute } from './utils'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import Groups from '../pages/Groups'

const styles = {
  container: {
    height: '100%',
    width: '100%',
    fontFamily: 'Helvetica',
    margin: '0px',
    padding: '0px'
  }
}

const AppRouter = (props: any) => {
  const { initialized } = useKeycloak()
  const { classes } = props;

  if (!initialized) {
    return <div>Loading...</div>
  }

  return (
    <div className={classes.container}>
      <Router>
        <Route exact path="/" component={HomePage} />
        <PrivateRoute exact path="/dashboard" component={Dashboard} />
        < PrivateRoute exact path="/servers" component={ServerList} />
        <PrivateRoute exact path="/servers/:id" component={ServerDisplay} />
        <PrivateRoute exact path="/servers/:id/add" component={AddTTNDeviceForm} />
        <PrivateRoute exact path="/groups" component={Groups} />
      </Router> 
    </div>
  )
}

AppRouter.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AppRouter);