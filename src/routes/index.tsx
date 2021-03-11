import * as React from 'react'
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom'

import { useKeycloak } from '@react-keycloak/web'

import HomePage from '../pages/Home'
import Dashboard from '../pages/Dashboard'
import ServerList from '../pages/ServerList'
import ServerDisplay from '../pages/ServerDisplay'

import { PrivateRoute } from './utils'

export const AppRouter = () => {
  const { initialized } = useKeycloak()

  if (!initialized) {
    return <div>Loading...</div>
  }

  return (
    <Router>
      <Route exact path="/" component={HomePage} />
      <PrivateRoute exact path="/dashboard" component={Dashboard} />
      <PrivateRoute exact path="/servers" component={ServerList} />
      <PrivateRoute exact path="/servers/:id" component={ServerDisplay} />
    </Router> 
  )
}