// test-srx.js
import dotenv from 'dotenv';
dotenv.config();

import axios from 'axios';
import * as srx from './services/signatureRx.service.js'; // Change to your actual file name

const BASE_URL = process.env.SIGNATURE_RX_BASE_URL || 'https://stage-srx.signaturerx.co.uk/api/v1';

console.log('🚀 SIGNATURE RX STAGE TEST');
console.log('============================================');
console.log('📌 URL:', BASE_URL);
console.log('📌 Email:', process.env.SIGNATURE_RX_EMAIL);
console.log('📌 Password:', '✅ Set');
console.log('============================================\n');

// ── TEST 1: Get Token ────────────────────────────────────
async function test1_Token() {
  console.log('🧪 TEST 1: Get JWT Token');
  console.log('----------------------------------------');
  
  try {
    const token = await srx.getSignatureRxToken();
    console.log('✅ Token received!');
    console.log('📥 Token (first 30 chars):', token.substring(0, 30) + '...');
    console.log('📥 Token length:', token.length);
    console.log('✅ PASSED\n');
    return { success: true, token };
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    console.log('');
    return { success: false };
  }
}

// ── TEST 2: Create Prescriber ────────────────────────────
async function test2_Prescriber() {
  console.log('🧪 TEST 2: Create Prescriber');
  console.log('----------------------------------------');
  
  const data = {
    email: `prescriber_${Date.now()}@test.com`,
    name: 'Dr. Test Prescriber',
    password: 'Test@12345',
  };
  
  console.log('📤 Sending:', data);
  
  try {
    const result = await srx.createPrescriber(data);
    console.log('✅ Prescriber created!');
    console.log('📥 Response:', result);
    console.log('✅ PASSED\n');
    return { success: true, result };
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    console.log('');
    return { success: false };
  }
}

// ── TEST 3: Create Patient ───────────────────────────────
async function test3_Patient() {
  console.log('🧪 TEST 3: Create Patient');
  console.log('----------------------------------------');
  
  const data = {
    email: `patient_${Date.now()}@test.com`,
    name: 'Jane Test Patient',
    dateOfBirth: '1990-01-01',
    phone: '+447123456789',
  };
  
  console.log('📤 Sending:', data);
  
  try {
    const result = await srx.createSignatureRxPatient(data);
    console.log('✅ Patient created!');
    console.log('📥 Response:', result);
    console.log('✅ PASSED\n');
    return { success: true, result };
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    console.log('');
    return { success: false };
  }
}

// ── TEST 4: Create Prescription ──────────────────────────
async function test4_Prescription() {
  console.log('🧪 TEST 4: Create Prescription with Patient');
  console.log('----------------------------------------');
  
  const timestamp = Date.now();
  const data = {
    patient: {
      email: `patient_rx_${timestamp}@test.com`,
      name: 'John Test Patient',
      dateOfBirth: '1985-05-15',
      phone: '+447987654321',
      address: '123 Test Street, London'
    },
    prescription: {
      medication: 'Amoxicillin',
      dosage: '500mg',
      quantity: 30,
      instructions: 'Take three times daily'
    }
  };
  
  console.log('📤 Sending:', JSON.stringify(data, null, 2));
  
  try {
    const result = await srx.createSignatureRxPrescription(data);
    console.log('✅ Prescription created!');
    console.log('📥 Response:', result);
    console.log('✅ PASSED\n');
    return { success: true, result };
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    console.log('');
    return { success: false };
  }
}

// ── TEST 5: Direct Login (Debug) ─────────────────────────
async function test5_DirectLogin() {
  console.log('🧪 TEST 5: Direct Login (Debug)');
  console.log('----------------------------------------');
  
  try {
    const response = await axios.post(`${BASE_URL}/login`, {
      email: process.env.SIGNATURE_RX_EMAIL,
      password: process.env.SIGNATURE_RX_PASSWORD,
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ Direct login successful!');
    console.log('📥 Response keys:', Object.keys(response.data));
    console.log('📥 access_token:', response.data.access_token ? '✅ Present' : '❌ Missing');
    console.log('📥 expires_in:', response.data.expires_in || '❌ Missing');
    console.log('✅ PASSED\n');
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ FAILED:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    console.log('');
    return { success: false };
  }
}

// ── Run All Tests ──────────────────────────────────────────
async function runTests() {
  console.log('🔄 Starting tests...\n');
  
  const results = [];
  
  // Test 5: Direct Login first (to debug)
  results.push({ name: 'Direct Login', ...await test5_DirectLogin() });
  
  // Test 1: Get Token
  results.push({ name: 'Get Token', ...await test1_Token() });
  
  // Only run create tests if token works
  if (results[0].success || results[1].success) {
    results.push({ name: 'Create Prescriber', ...await test2_Prescriber() });
    results.push({ name: 'Create Patient', ...await test3_Patient() });
    results.push({ name: 'Create Prescription', ...await test4_Prescription() });
  } else {
    console.log('⚠️ Skipping create tests - authentication failed\n');
  }
  
  // ── Summary ──────────────────────────────────────────────
  console.log('============================================');
  console.log('📊 TEST SUMMARY');
  console.log('============================================');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(r => {
    console.log(`${r.success ? '✅' : '❌'} ${r.name}`);
  });
  
  console.log('\n--------------------------------------------');
  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  
  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Your integration is working perfectly!');
    console.log('✅ Data is being sent to SignatureRX Stage!');
  } else if (passed >= total / 2) {
    console.log('\n⚠️ Partial success - some tests passed');
    console.log('Check failed tests above for details');
  } else {
    console.log('\n❌ Most tests failed');
    console.log('\n🔍 Common issues:');
    console.log('1. Wrong API endpoints');
    console.log('2. Invalid credentials');
    console.log('3. Network/VPN issues');
    console.log('4. Missing required fields');
  }
  
}

// ── Run ─────────────────────────────────────────────────────
runTests();