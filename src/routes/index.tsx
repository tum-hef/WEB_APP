import * as React from 'react'
import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom'

import { useKeycloak } from '@react-keycloak/web'

import Dashboard from '../pages/Dashboard'
import HomePage from '../pages/Home'

import { PrivateRoute } from './utils'

export const AppRouter = () => {
  const { initialized } = useKeycloak()

  if (!initialized) {
    return <div>Loading...</div>
  }

  return (
    <Router>
      <Route path="/" component={HomePage} />
      <PrivateRoute path="/home" component={Dashboard} />
    </Router>
  )
}