import Keycloak from 'keycloak-js';
const keycloak = new Keycloak({
  url: process.env.REACT_APP_KEYCLOAK_URL,
  realm: process.env.REACT_APP_KEYCLOAK_REALM ? process.env.REACT_APP_KEYCLOAK_REALM : 'master',
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID ? process.env.REACT_APP_KEYCLOAK_CLIENT_ID : 'react',
});


export default keycloak;