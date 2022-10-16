interface IUserInfo {
  acr: string;
  email: string;
  at_hash: string;
  aud: string;
  auth_time: string;
  azp: string;
  email_verified: boolean;
  exp: number;
  family_name: string;
  given_name: string;
  iat: number;
  iss: string;
  jti: string;
  name: string;
  nonce: string;
  preferred_username: string;
  session_state: string;
  sub: string;
  typ: string;
}

export default IUserInfo;
