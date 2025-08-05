import axios from 'axios';

const NASA_API_BASE_URL = 'https://firms.modaps.eosdis.nasa.gov/api/';
const JWT_TOKEN = 'eyJ0eXAiOiJKV1QiLCJvcmlnaW4iOiJFYXJ0aGRhdGEgTG9naW4iLCJzaWciOiJlZGxqd3RwdWJrZXlfb3BzIiwiYWxnIjoiUlMyNTYifQ.eyJ0eXBlIjoiVXNlciIsInVpZCI6ImhtenRyaG4iLCJleHAiOjE3NTkyMzk3MjUsImlhdCI6MTc1NDA1NTcyNSwiaXNzIjoiaHR0cHM6Ly91cnMuZWFydGhkYXRhLm5hc2EuZ292IiwiaWRlbnRpdHlfcHJvdmlkZXIiOiJlZGxfb3BzIiwiYWNyIjoiZWRsIiwiYXNzdXJhbmNlX2xldmVsIjozfQ.v7tHHNiWx_XcqaeN-A-Aud_CuqZ0rD9Qhmsuj9W4VxJZZ-Wpi3Q5n4nPyDh4Akph20Xmh7QjBN36oPcMRvxha24O0v0nw17vv_FMo-0gV_R-ICeHd5EP8hb3Kiebu0YP_r5er-igqPOOgFxCfsbjAWyDFClnQCGq7rXVproMLJrtm7hfg2LfNkPs0Vc5EaDSSZ0_ioA4nidKtFAfxfjjxDGXKrhZ8qCrwpA40ZKoP97DmOcL5LN_uRYJPVi1mFEVpFlIC5wEAufaj21OBkTCXtz7FUAeI31uVghQcUGXVytmKyye3284wN6VJwap2C4vDxV1vZF7cv9g-rCLYeMa3w';

const nasaApi = axios.create({
  baseURL: NASA_API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${JWT_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

interface SatelliteDataParams {
  latitude: number;
  longitude: number;
  radius: number;
  bbox?: string; // Bounding box parameter for geographic queries
}

export const getModisData = async (params: SatelliteDataParams) => {
  try {
    const response = await nasaApi.get('/modis', { params });
    return response.data;
  } catch (error) {
    console.error('MODIS data fetch error:', error);
    throw error;
  }
};

export const getViirsData = async (params: SatelliteDataParams) => {
  try {
    const response = await nasaApi.get('/viirs', { params });
    return response.data;
  } catch (error) {
    console.error('VIIRS data fetch error:', error);
    throw error;
  }
};

export const getBoundingBoxData = async (bbox: string) => {
  try {
    const response = await nasaApi.get(`/fires?bbox=${bbox}`);
    return response.data;
  } catch (error) {
    console.error('Bounding box data fetch error:', error);
    throw error;
  }
};