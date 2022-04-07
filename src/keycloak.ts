import Keycloak from 'keycloak-js';

// Setup Keycloak instance as needed
// Pass initialization options as required or leave blank to load from 'keycloak.json'
const keycloak = Keycloak({
  url: 'http://tuzehez-hefiot.srv.mwn.de:8080/auth',
  realm: 'prod_dev',
  clientId: 'react_test',
});

export default keycloak;