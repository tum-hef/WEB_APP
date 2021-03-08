import * as React from 'react'
import ReactDOM from 'react-dom'

import { ReactKeycloakProvider } from '@react-keycloak/web'

import keycloak from './keycloak'
import { AppRouter } from './routes'

const eventLogger = (event: unknown, error: unknown) => {
  console.log('onKeycloakEvent', event, error)
}

const tokenLogger = (tokens: unknown) => {
  console.log('onKeycloakTokens', tokens)
}

ReactDOM.render(
  <React.StrictMode>
    <ReactKeycloakProvider
      authClient={keycloak}
      onEvent={eventLogger}
      onTokens={tokenLogger}
    >
      <AppRouter />
    </ReactKeycloakProvider>
  </React.StrictMode>,
  document.getElementById('root')
)


