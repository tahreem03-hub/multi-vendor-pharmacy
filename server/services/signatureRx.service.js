import axios from 'axios';

const BASE_URL = process.env.SIGNATURE_RX_BASE_URL || 'https://stage-srx.signaturerx.co.uk/api/v1';

let cachedToken = null;
let tokenExpiry = null;

// ── Get JWT Token ─────────────────────────────────────────────
export const getSignatureRxToken = async () => {

  console.log("👉 SignatureRx URL being used:", BASE_URL);
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
      email: process.env.SIGNATURE_RX_EMAIL,
      password: process.env.SIGNATURE_RX_PASSWORD,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DrGPharma-Server/1.0',
        'Accept': 'application/json',
      },
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
      console.log('Token invalid, getting fresh token...');

      const newToken = await getSignatureRxToken();
      config.headers.Authorization = `Bearer ${newToken}`;
      const retryResponse = await axios(config);
      return retryResponse.data;
    }
    throw error;
  }
};

// ══════════════════════════════════════════════════════════════
//  ADAPTER LAYER
//  Your app keeps passing its own model shape (name, dateOfBirth,
//  phone, address, prescription...). These helpers translate it
//  into SignatureRx's schema right before the request. Nothing at
//  your call sites has to change.
// ══════════════════════════════════════════════════════════════

// "Jane Test Patient" -> { first_name: "Jane", last_name: "Test Patient" }
// Strips a leading title (Dr./Mr./etc). last_name is required by the API,
// so if only one word is given we reuse it as the last_name.
const splitName = (fullName = '') => {
  const parts = String(fullName)
    .trim()
    .replace(/^(dr|mr|mrs|ms|miss|prof)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean);
  const first_name = parts.shift() || '';
  const last_name = parts.join(' ') || first_name; // fallback: last_name can't be empty
  return { first_name, last_name };
};

// "1990-01-01" (or a Date) -> { birth_day:"01", birth_month:"01", birth_year:"1990" }
// API wants STRINGS: DD (2), MM (2), YYYY (4). Regex-parse ISO first to avoid
// timezone shifting the day.
const splitDob = (dob) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dob || ''));
  if (m) return { birth_year: m[1], birth_month: m[2], birth_day: m[3] };
  const d = new Date(dob);
  if (isNaN(d)) return { birth_year: '', birth_month: '', birth_day: '' };
  return {
    birth_year: String(d.getFullYear()),
    birth_month: String(d.getMonth() + 1).padStart(2, '0'),
    birth_day: String(d.getDate()).padStart(2, '0'),
  };
};

// "+447123456789" -> "447123456789"  (country code, no +, no spaces/dashes)
const normalizePhone = (phone = '') => String(phone).replace(/\D/g, '');

// Your model -> SignatureRx patient schema
const toSrxPatient = (p = {}) => {
  const { first_name, last_name } = splitName(p.name || `${p.first_name || ''} ${p.last_name || ''}`);
  return {
    first_name,
    last_name,
    // ⚠️ REQUIRED by API, not in your current model. Must be Male | Female | Other.
    //    Add it to whatever you pass in, or set a real default.
    gender: p.gender || 'Male',
    email: p.email,
    phone: normalizePhone(p.phone),
    ...splitDob(p.dateOfBirth || p.dob),
    // Your single `address` string maps to line 1. If you have structured
    // fields already, they win.
    address_ln1: p.address_ln1 || p.address || '',
    address_ln2: p.address_ln2,
    city: p.city,
    post_code: p.post_code || p.postcode,
    country: p.country || 'United Kingdom', // required
    // Required on the /prescriptions-patient endpoint (optional on /patients).
    // In production pass your real internal patient id; email is a stable fallback.
    client_ref_id: p.client_ref_id || (p.id != null ? String(p.id) : p.email),
    nhs_number: p.nhs_number, // optional, 10 digits
  };
  // NB: undefined fields are dropped automatically during JSON serialization.
};

// Your model -> SignatureRx prescriber schema
const toSrxPrescriber = (p = {}) => {
  const { first_name, last_name } = splitName(p.name || `${p.first_name || ''} ${p.last_name || ''}`);
  return {
    name: first_name,        // docs: prescriber first-name field is `name`
    last_name,
    email: p.email,
    phone_number: Number(normalizePhone(p.phone_number || p.phone)) || 0, // numeric per docs
    // ⚠️ The three below are REQUIRED and are not in your model. There is no way
    //    to derive them — they have to be supplied per prescriber.
    prescriber_status: p.prescriber_status || 'active',                 // confirm accepted enum
    registration_number: p.registration_number || '',                  // e.g. GMC number
    professional_registration_body: p.professional_registration_body || 'GMC', // GMC/GPhC/NMC/GDC?
    secure_pin: Number(p.secure_pin) || 0,                              // 6-digit signing pin
    // NOTE: the docs show NO `password` field for prescribers — your old test sent one; drop it.
  };
};

// MedicineItem schema (confirmed by the API's validation errors):
//   description (required) | qty (required) | directions (required)
// Your model's `medication` + `dosage` fold into `description`
// (e.g. "Amoxicillin 500mg"). `quantity` -> `qty`, `instructions` -> `directions`.
const toMedicineItem = (rx = {}) => ({
  description: [rx.medication || rx.name || rx.description, rx.dosage]
    .filter(Boolean)
    .join(' '),
  qty: rx.quantity ?? rx.qty,
  directions: rx.instructions || rx.directions,
});

// Your model { patient, prescription, ... } -> SignatureRx prescription schema
const toSrxPrescription = (data = {}) => ({
  action: data.action || 'draft', // draft | issueForCollection | issueToContact | issueForDelivery | issueOnly
  secure_pin: data.secure_pin,    // prescriber's 6-digit signing pin
  notify: data.notify ?? false,   // false = no email/sms (safe for testing)
  patient: toSrxPatient(data.patient),
  // Accept either a ready `medicines` array OR your old single `prescription` object.
  medicines: Array.isArray(data.medicines)
    ? data.medicines
    : (data.prescription ? [toMedicineItem(data.prescription)] : []),
  prescriber_ip: data.prescriber_ip || '127.0.0.1', // required, IPv4
  notes: data.notes,
  client_ref_id: data.client_ref_id,
  external_id: data.external_id,
});

// Your model -> /client/prescribers schema (clinic-scoped route).
// Differs from /prescribers: first_name/last_name, `phone`, `registration_type`
// (not prescriber_status), and a required `clinic_unique_id`.
const toClientPrescriber = (p = {}) => ({
  first_name: p.first_name || splitName(p.name).first_name,
  last_name: p.last_name || splitName(p.name).last_name,
  email: p.email,
  phone: normalizePhone(p.phone || p.phone_number),
  registration_number: p.registration_number,
  professional_registration_body: p.professional_registration_body || 'GMC',
  // ⚠️ REQUIRED. Profession type — try the same codes as /prescribers-status
  //    (e.g. 'doctor'). Confirm the accepted value for this route.
  registration_type: p.registration_type || p.prescriber_status,
  // ⚠️ REQUIRED. Your clinic's unique id (from SignatureRx). See notes below.
  clinic_unique_id: p.clinic_unique_id,
  secure_pin: p.secure_pin,
  // Optional: include to UPDATE an existing prescriber instead of creating.
  prescriber_id: p.prescriber_id,
});

// ── Create / Update Prescriber (clinic route) ─────────────────
// Use this if your account only has access to /client/prescribers.
// Returns data.prescriber.prescriber_id on success.
export const createClientPrescriber = async (prescriberData) => {
  try {
    const payload = toClientPrescriber(prescriberData);
    console.log(' Creating client prescriber in SignatureRx:', payload.email);
    const result = await makeAuthRequest('POST', '/client/prescribers', payload);
    console.log('Client prescriber created in SignatureRx');
    return result;
  } catch (error) {
    console.error('createClientPrescriber error:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'Failed to create client prescriber',
      data: error.response?.data,
    };
  }
};

// ── Get valid prescriber statuses (profession types) ──────────
// Returns e.g. [{ status: 'doctor', name: 'Doctor' }, ...].
// `status` is the code you send as prescriber_status when creating a prescriber.
export const getPrescriberStatuses = async () => {
  try {
    const result = await makeAuthRequest('GET', '/prescribers-status');
    return result.data || result;
  } catch (error) {
    console.error('getPrescriberStatuses error:', error.response?.data || error.message);
    throw error;
  }
};

// ── Create Prescriber ─────────────────────────────────────────
export const createPrescriber = async (prescriberData) => {
  try {
    const payload = toSrxPrescriber(prescriberData);
    console.log(' Creating prescriber in SignatureRx:', payload.email);
    const result = await makeAuthRequest('POST', '/prescribers', payload);
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
    const payload = toSrxPatient(patientData);
    console.log('📤 Creating patient in SignatureRx:', payload.email);
    const result = await makeAuthRequest('POST', '/patients', payload);
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
export const createSignatureRxPrescription = async (payload, prescriberId = null) => {
  try {
    console.log('✅ Creating prescription with patient in SignatureRx');

    const body = toSrxPrescription(payload);

    // Endpoint is /prescriptions-patient (hyphenated, singular) — the old
    // /prescriptions/patients path was the cause of the "Server Error".
    // prescriber_id is a QUERY param, required only for clinic-level users.
    const params = prescriberId ? { prescriber_id: prescriberId } : null;

    const result = await makeAuthRequest('POST', '/prescriptions-patient', body, params);

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