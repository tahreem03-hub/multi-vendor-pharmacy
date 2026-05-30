import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from 'react-hot-toast';
import { Lock, User, FileText, AlertCircle } from 'lucide-react';
import API from "../api/axios";

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  border: '1.5px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '13px',
  color: '#0f172a',
  background: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s'
};

// ✅ Dark label style
const labelStyle = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#0f172a',
  display: 'block',
  marginBottom: '6px'
};

const InputGroup = ({ label, type = "text", placeholder, options = null, value, onChange, required = true }) => (
  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <label style={labelStyle}>
      {label}{required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
    </label>
    {options ? (
      <select value={value || ""} onChange={onChange}
        style={{ ...inputStyle, cursor: 'pointer' }}
        onFocus={e => e.target.style.borderColor = '#0f172a'}
        onBlur={e => e.target.style.borderColor = '#e2e8f0'}>
        <option value="">Select...</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    ) : (
      <input type={type} placeholder={placeholder} value={value || ""} onChange={onChange} required={required}
        style={inputStyle}
        onFocus={e => e.target.style.borderColor = '#0f172a'}
        onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
    )}
  </div>
);

const Register = () => {
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState(1);
  const [isLedByMedicalProf, setIsLedByMedicalProf] = useState(null);
  const [accountType, setAccountType] = useState("Prescriber");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    salutation: 'Mr', firstName: '', lastName: '',
    email: '', password: '', confirmPassword: '',
    phoneNumber: '', address: '', dob: '',
    accountType: 'Prescriber', isAuthorisedProfessional: true, agreedToTerms: false
  });

  const handleChange = (name) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextAction = (e) => {
    e.preventDefault();
    if (subStep === 1) {
      if (isLedByMedicalProf === null) return toast.error("Please make a selection before moving forward.");
      setSubStep(2);
    } else {
      handleRegister(e);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return toast.error("Passwords do not match.");
    if (!formData.agreedToTerms) return toast.error("You must agree to the terms and conditions.");
    setLoading(true);
    try {
      await API.post("/auth/register", {
        firstName: formData.firstName, lastName: formData.lastName,
        email: formData.email, password: formData.password,
        phoneNumber: formData.phoneNumber, address: formData.address,
        dob: formData.dob, agreedToTerms: formData.agreedToTerms,
        isAuthorisedProfessional: isLedByMedicalProf === true,
        accountType: isLedByMedicalProf ? accountType : undefined
      });
      toast.success("Verification code sent to your email");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating account");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/verify-otp", { email: formData.email, otp });
      toast.success("Account verified successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      display: 'flex', alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '48px 24px',
      boxSizing: 'border-box'
    }}>
      <div style={{ width: '100%', maxWidth: '900px' }}>

        {step === 1 ? (
          <form onSubmit={handleNextAction}>

            {/* Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '36px' }}>
              {[1, 2].map(n => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%',
                    background: subStep >= n ? '#0f172a' : '#e2e8f0',
                    color: subStep >= n ? '#fff' : '#94a3b8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: '700'
                  }}>{n}</div>
                  {n < 2 && <div style={{ width: '48px', height: '2px', background: subStep > n ? '#0f172a' : '#e2e8f0' }} />}
                </div>
              ))}
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', marginLeft: '8px' }}>
                {subStep === 1 ? 'Account screening' : 'Account details'}
              </span>
            </div>

            {/* ── SUB-STEP 1 ── */}
            {subStep === 1 && (
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                  Are you or do you work with a Registered UK Medical Professional?
                </h2>
                <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6', marginBottom: '28px' }}>
                  Please select if your company is healthcare professional led. This helps us determine what kind of account you require.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                  {/* YES */}
                  <div onClick={() => { setIsLedByMedicalProf(true); setAccountType("Prescriber"); }}
                    style={{
                      border: isLedByMedicalProf === true ? '2px solid #0f172a' : '1.5px solid #e2e8f0',
                      borderRadius: '12px', padding: '20px', cursor: 'pointer',
                      background: '#fff', transition: 'all 0.2s'
                    }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                        border: `2px solid ${isLedByMedicalProf === true ? '#0f172a' : '#cbd5e1'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {isLedByMedicalProf === true && <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#0f172a' }} />}
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 10px', fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                          Yes — led by a UK Medical Professional
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '12px', color: '#64748b', lineHeight: '1.8' }}>
                          <li>Doctor registered with the GMC</li>
                          <li>Dentist registered with the GDC</li>
                          <li>Nurse/Midwife registered with the NMC</li>
                          <li>Pharmacist Independent Prescriber</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* NO */}
                  <div onClick={() => { setIsLedByMedicalProf(false); setAccountType("user"); }}
                    style={{
                      border: isLedByMedicalProf === false ? '2px solid #0f172a' : '1.5px solid #e2e8f0',
                      borderRadius: '12px', padding: '20px', cursor: 'pointer',
                      background: '#fff', transition: 'all 0.2s'
                    }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                        border: `2px solid ${isLedByMedicalProf === false ? '#0f172a' : '#cbd5e1'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {isLedByMedicalProf === false && <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#0f172a' }} />}
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                          No — not led by a UK Medical Professional
                        </h4>
                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: '1.6' }}>
                          No registered UK medical professionals in the company. A therapist account will be created.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info cards */}
                {isLedByMedicalProf === true && (
                  <div style={{ marginBottom: '32px' }}>
                    <p style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
                      Before you proceed
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      {[
                        { icon: AlertCircle, title: 'You must be:', items: ['A UK qualified prescriber', 'Work with a UK prescriber', 'Qualified HCP for non-prescription items'] },
                        { icon: FileText, title: 'You will need:', items: ['Passport or Drivers License copy', 'A mobile phone number', 'A non-generic email address'] },
                        { icon: User, title: 'Photo ID must be:', items: ['Valid passport or driving licence', 'In colour & clear focus', 'Showing name, signature & expiry', 'JPG or PNG (not PDF)'] },
                      ].map(({ icon: Icon, title, items }) => (
                        <div key={title} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                            <Icon size={14} color="#475569" style={{ flexShrink: 0, marginTop: '1px' }} />
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a' }}>{title}</span>
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '11.5px', color: '#64748b', lineHeight: '1.7' }}>
                            {items.map(i => <li key={i}>{i}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: '#0f172a', fontWeight: '700', textDecoration: 'underline' }}>Sign in</Link>
                  </p>
                  <button type="submit" style={{
                    padding: '13px 32px', background: '#0f172a', color: '#fff',
                    border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer'
                  }}>
                    Confirm & Continue →
                  </button>
                </div>
              </div>
            )}

            {/* ── SUB-STEP 2 ── */}
            {subStep === 2 && (
              <div>
                <button type="button" onClick={() => setSubStep(1)} style={{
                  background: 'none', border: 'none', color: '#64748b', fontSize: '13px',
                  fontWeight: '600', cursor: 'pointer', padding: 0, marginBottom: '20px',
                  display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                  ← Back to screening
                </button>

                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '6px', letterSpacing: '-0.01em' }}>
                  Create your account
                </h2>
                <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6', marginBottom: '28px' }}>
                  Fill in your details below. Your email and password will let you return at any time.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

                  {/* LEFT — Your Details */}
                  <div style={{
                    background: '#fff', border: '1px solid #e2e8f0',
                    borderRadius: '12px', padding: '24px',
                    display: 'flex', flexDirection: 'column', gap: '16px'
                  }}>
                    <p style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', margin: 0, paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                      Your Details
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                      <InputGroup label="Salutation" options={["Mr", "Mrs", "Ms", "Dr", "Prof"]} value={formData.salutation} onChange={handleChange("salutation")} required={false} />
                      <InputGroup label="First Name" value={formData.firstName} onChange={handleChange("firstName")} />
                    </div>
                    <InputGroup label="Last Name" value={formData.lastName} onChange={handleChange("lastName")} />
                    <InputGroup label="Email Address" type="email" value={formData.email} onChange={handleChange("email")} />
                    <InputGroup label="Phone Number" placeholder="+44" value={formData.phoneNumber} onChange={handleChange("phoneNumber")} />
                    <InputGroup label="Home Address" value={formData.address} onChange={handleChange("address")} />
                    <InputGroup label="Date of Birth" type="date" value={formData.dob} onChange={handleChange("dob")} />
                  </div>

                  {/* RIGHT — Password & Terms */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{
                      background: '#fff', border: '1px solid #e2e8f0',
                      borderRadius: '12px', padding: '24px',
                      display: 'flex', flexDirection: 'column', gap: '16px'
                    }}>
                      <p style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', margin: 0, paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                        Create a Password
                      </p>
                      <InputGroup label="Password" type="password" value={formData.password} onChange={handleChange("password")} />
                      <InputGroup label="Repeat Password" type="password" value={formData.confirmPassword} onChange={handleChange("confirmPassword")} />

                      {/* Requirements */}
                      <div style={{
                        background: '#f8fafc', border: '1px solid #e2e8f0',
                        borderRadius: '8px', padding: '14px 16px',
                        display: 'flex', flexDirection: 'column', gap: '7px'
                      }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Requirements
                        </span>
                        {[
                          'Minimum 8 characters',
                          'At least one uppercase letter',
                          'At least one number',
                          'At least one special character (! % & ?)'
                        ].map(r => (
                          <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#cbd5e1', flexShrink: 0 }} />
                            <span style={{ fontSize: '12px', color: '#475569' }}>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Terms */}
                    <label style={{
                      display: 'flex', alignItems: 'flex-start', gap: '10px',
                      cursor: 'pointer', fontSize: '12px', color: '#475569', lineHeight: '1.5',
                      background: '#fff', border: '1px solid #e2e8f0',
                      borderRadius: '10px', padding: '14px 16px'
                    }}>
                      <input type="checkbox" checked={formData.agreedToTerms}
                        onChange={handleChange("agreedToTerms")} required
                        style={{ marginTop: '3px', accentColor: '#0f172a' }} />
                      <span>I accept and agree to the website{' '}
                        <span style={{ color: '#0f172a', fontWeight: '700' }}>Terms of Use</span> and{' '}
                        <span style={{ color: '#0f172a', fontWeight: '700' }}>Privacy Policy</span>.
                      </span>
                    </label>

                    <button type="submit" disabled={loading} style={{
                      width: '100%', padding: '15px',
                      background: '#0f172a', color: '#fff',
                      border: 'none', borderRadius: '10px',
                      fontSize: '13px', fontWeight: '700',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1
                    }}>
                      {loading ? 'Creating Account...' : 'CREATE ACCOUNT →'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        ) : (
          /* OTP */
          <div style={{ maxWidth: '380px', margin: '60px auto', textAlign: 'center' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '14px',
              background: '#fff', border: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
            }}>
              <Lock size={24} color="#0f172a" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
              Enter Security Code
            </h2>
            <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6', marginBottom: '32px' }}>
              We sent a 6-digit code to <strong style={{ color: '#0f172a' }}>{formData.email}</strong>
            </p>
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="text" placeholder="000000" maxLength={6}
                value={otp} onChange={(e) => setOtp(e.target.value)} required
                style={{
                  width: '100%', padding: '18px',
                  border: '1.5px solid #e2e8f0', borderRadius: '12px',
                  fontSize: '28px', fontWeight: '700', textAlign: 'center',
                  letterSpacing: '0.4em', outline: 'none', background: '#fff', boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#0f172a'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '15px', background: '#0f172a',
                color: '#fff', border: 'none', borderRadius: '10px',
                fontSize: '13px', fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}>
                {loading ? 'Verifying...' : 'Verify & Activate Account'}
              </button>
            </form>
            <button type="button" onClick={() => setStep(1)} style={{
              background: 'none', border: 'none', color: '#94a3b8',
              fontSize: '12px', fontWeight: '600', marginTop: '20px',
              cursor: 'pointer', textDecoration: 'underline'
            }}>
              Change email address
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;