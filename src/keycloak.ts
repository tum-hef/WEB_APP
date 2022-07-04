import Keycloak from 'keycloak-js';
const keycloak = Keycloak({
  url: 'http://localhost:8080',
  realm: "keycloak-react-auth",
  clientId: "react",
});

export default keycloak;