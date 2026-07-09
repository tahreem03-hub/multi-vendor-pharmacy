import axios from 'axios';

const BASE_URL = process.env.SIGNATURE_RX_BASE_URL || 'https://app.signaturerx.co.uk/api/v1';

let cachedToken = null;
let tokenExpiry = null;

// ── Get JWT Token ─────────────────────────────────────────────
export const getSignatureRxToken = async () => {
  // Valid token hai toh wahi use karo
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  // token is about to expire refresh it
  if (cachedToken) {
    try {
      return await refreshSignatureRxToken();
    } catch (err) {
      console.log(' Refresh failed, getting new token with credentials');
    }
  }

  // getting token first time or refresh failed then also get new token
  try {
    const { data } = await axios.post(`${BASE_URL}/login`, {
      email:    process.env.SIGNATURE_RX_EMAIL,
      password: process.env.SIGNATURE_RX_PASSWORD,
    });

    cachedToken = data.access_token;
    // expires in 1 hour buffer
    tokenExpiry = Date.now() + ((data.expires_in || 1440) * 60 * 1000) - (60 * 60 * 1000);

    console.log('SignatureRx token obtained');
    return cachedToken;
  } catch (err) {
    console.error('SignatureRx token error:', err.response?.data || err.message);
    throw new Error('Failed to get SignatureRx token');
  }
};

// ── Refresh Token ─────────────────────────────────────────────
const refreshSignatureRxToken = async () => {
  try {
    const { data } = await axios.post(`${BASE_URL}/refresh`, {}, {
      headers: {
        Authorization: `Bearer ${cachedToken}`, // return current token
        'Content-Type': 'application/json',
      }
    });

    cachedToken = data.access_token;
    tokenExpiry = Date.now() + ((data.expires_in || 1440) * 60 * 1000) - (60 * 60 * 1000);

    console.log('SignatureRx token refreshed');
    return cachedToken;
  } catch (err) {
    cachedToken = null;
    tokenExpiry = null;
    console.error('Refresh failed:', err.response?.data || err.message);
    throw err;
  }
};

// ── Helper: Make authenticated request ───────────────────────
export const makeAuthRequest = async (method, url, data = null, params = null) => {
  const token = await getSignatureRxToken();

  const config = {
    method,
    url: `${BASE_URL}${url}`,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    params,
  };

  if (data) config.data = data;

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      // Token invalid — clear karo aur fresh login karo
      cachedToken = null;
      tokenExpiry = null;
      console.log('🔄 Token invalid, getting fresh token...');

      const newToken = await getSignatureRxToken();
      config.headers.Authorization = `Bearer ${newToken}`;
      const retryResponse = await axios(config);
      return retryResponse.data;
    }
    throw error;
  }
};

// ── Create Prescriber ─────────────────────────────────────────
export const createPrescriber = async (prescriberData) => {
  try {
    console.log(' Creating prescriber in SignatureRx:', prescriberData.email);
    const result = await makeAuthRequest('POST', '/prescribers', prescriberData);
    console.log('Prescriber created in SignatureRx');
    return result;
  } catch (error) {
    console.error('createPrescriber error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'Failed to create prescriber',
      data: error.response?.data
    };
  }
};


// ── PRESCRIPTION METHODS ───────────────────────────────────

// ── Create Patient in SignatureRx ─────────────────────────────
export const createSignatureRxPatient = async (patientData) => {
  try {
    console.log('📤 Creating patient in SignatureRx:', patientData.email);
    const result = await makeAuthRequest('POST', '/patients', patientData);
    console.log('✅ Patient created in SignatureRx');
    return result;
  } catch (error) {
    console.error('❌ createSignatureRxPatient error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'Failed to create patient in SignatureRx',
      data: error.response?.data
    };
  }
};

// ── Create Prescription with Patient ──────────────────────────
export const createSignatureRxPrescription = async (payload) => {
  try {
    console.log('✅ Creating prescription with patient in SignatureRx');
    
    // ✅ Ek hi call — patient + prescription dono
    const result = await makeAuthRequest('POST', '/prescriptions/patients', payload);
    
    console.log('✅ Prescription created in SignatureRx');
    return result;

  } catch (error) {
    console.error('❌ createSignatureRxPrescription error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || 'Failed to create prescription',
      data: error.response?.data
    };
  }
};