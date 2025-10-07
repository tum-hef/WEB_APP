import Keycloak from 'keycloak-js';
const keycloakConfig = {
  url: process.env.REACT_APP_KEYCLOAK_URL || 'http://localhost:8080/auth',
  realm: process.env.REACT_APP_KEYCLOAK_REALM || 'master',
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || 'my-client',
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
