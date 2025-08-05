import { jwtDecode } from 'jwt-decode';

// NASA Earthdata API configuration
const NASA_EARTHDATA_API = {
  baseURL: 'https://firms.modaps.eosdis.nasa.gov/api/',
  token: 'eyJ0eXAiOiJKV1QiLCJvcmlnaW4iOiJFYXJ0aGRhdGEgTG9naW4iLCJzaWciOiJlZGxqd3RwdWJrZXlfb3BzIiwiYWxnIjoiUlMyNTYifQ.eyJ0eXBlIjoiVXNlciIsInVpZCI6ImhtenRyaG4iLCJleHAiOjE3NTkyMzk3MjUsImlhdCI6MTc1NDA1NTcyNSwiaXNzIjoiaHR0cHM6Ly91cnMuZWFydGhkYXRhLm5hc2EuZ292IiwiaWRlbnRpdHlfcHJvdmlkZXIiOiJlZGxfb3BzIiwiYWNyIjoiZWRsIiwiYXNzdXJhbmNlX2xldmVsIjozfQ.v7tHHNiWx_XcqaeN-A-Aud_CuqZ0rD9Qhmsuj9W4VxJZZ-Wpi3Q5n4nPyDh4Akph20Xmh7QjBN36oPcMRvxha24O0v0nw17vv_FMo-0gV_R-ICeHd5EP8hb3Kiebu0YP_r5er-igqPOOgFxCfsbjAWyDFClnQCGq7rXVproMLJrtm7hfg2LfNkPs0Vc5EaDSSZ0_ioA4nidKtFAfxfjjxDGXKrhZ8qCrwpA40ZKoP97DmOcL5LN_uRYJPVi1mFEVpFlIC5wEAufaj21OBkTCXtz7FUAeI31uVghQcUGXVytmKyye3284wN6VJwap2C4vDxV1vZF7cv9g-rCLYeMa3w',
  tokenExpiryBuffer: 300, // 5 minutes buffer for token expiry
};

// Interface for JWT payload
interface JwtPayload {
  exp: number;
  iat: number;
  iss: string;
  uid: string;
}

// Check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    // Check if token is expired with buffer
    return decoded.exp * 1000 < Date.now() + NASA_EARTHDATA_API.tokenExpiryBuffer * 1000;
  } catch (error) {
    console.error('Token decode error:', error);
    return true;
  }
};

// Get valid token (would include refresh logic in production)
const getValidToken = (): string => {
  // In a real implementation, this would check token validity
  // and trigger refresh logic if needed
  return NASA_EARTHDATA_API.token;
};

export { NASA_EARTHDATA_API, isTokenExpired, getValidToken };