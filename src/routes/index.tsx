import * as React from 'react'
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom'
import { useKeycloak } from '@react-keycloak/web'
import HomePage from '../pages/Home'
import Dashboard from '../pages/Dashboard'
import ServerList from '../pages/ServerList'
import ServerDisplay from '../pages/ServerDisplay'
import { PrivateRoute } from './utils'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'

const styles = {
  container: {
    height: '100%',
    width: '100%',
    fontFamily: 'Helvetica'
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
      </Router> 
    </div>
  )
}

AppRouter.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AppRouter);