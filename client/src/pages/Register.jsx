import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from 'react-hot-toast';
import { Pill, Lock, User, Briefcase, MapPin, CheckCircle, Shield, Star, Info, FileText, AlertCircle } from 'lucide-react';
import API from "../api/axios";

// ✅ Outside component — no re-mount on typing
const InputGroup = ({ label, name, type = "text", placeholder, options = null, value, onChange, required = true }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <label style={{
      fontSize: '10px', fontWeight: '700', color: '#64748b',
      textTransform: 'uppercase', letterSpacing: '0.1em'
    }}>
      {label}{required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
    </label>
    {options ? (
      <select
        value={value || ""}
        onChange={onChange}
        style={{
          width: '100%', 
          padding: '14px 18px', 
          border: '1.5px solid #e2e8f0', borderRadius: '10px',
          fontSize: '13px', color: '#0f172a', background: '#fff',
          outline: 'none', cursor: 'pointer',
          fontFamily: 'inherit', transition: 'border-color 0.2s'
        }}
        onFocus={e => e.target.style.borderColor = '#0f172a'}
        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
      >
        <option value="">Select...</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    ) : (
      <input
        type={type}
        placeholder={placeholder}
        value={value || ""}
        onChange={onChange}
        required={required}
        style={{
          width: '100%', 
          padding: '14px 18px', 
          border: '1.5px solid #e2e8f0', borderRadius: '10px',
          fontSize: '13px', color: '#0f172a', background: '#fff',
          outline: 'none', boxSizing: 'border-box',
          fontFamily: 'inherit', transition: 'border-color 0.2s'
        }}
        onFocus={e => e.target.style.borderColor = '#0f172a'}
        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
      />
    )}
  </div>
);

const SectionHeader = ({ icon: Icon, title, step, total }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingBottom: '16px', marginBottom: '24px',
    borderBottom: '1px solid #f1f5f9'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '8px',
        background: '#0f172a',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={16} color="white" />
      </div>
      <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{title}</span>
    </div>
    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
      Step {step} of {total}
    </span>
  </div>
);

const Register = () => {
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState(1);
  
  const [isLedByMedicalProf, setIsLedByMedicalProf] = useState(null); 
  const [accountType, setAccountType] = useState("Prescriber"); // Matches Schema Enum ["Prescriber", "Practitioner"]
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    salutation: 'Mr',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',               // Ensure this matches the key expected by backend
    address: '',                   // Ensure this matches the key expected by backend
    dob: '',
    accountType: 'Prescriber',     // Dynamic base setting matching selection
    isAuthorisedProfessional: true, 
    agreedToTerms: false           // Connected directly to validation checkbox
  });

  // Generic change handler for text/select fields and checkbox validation
  const handleChange = (name) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNextAction = (e) => {
    e.preventDefault();
    if (subStep === 1) {
      if (isLedByMedicalProf === null) {
        return toast.error("Please make a selection before moving forward.");
      }
      setSubStep(2);
    } else {
      handleRegister(e);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match.");
    }
    if (!formData.agreedToTerms) {
      return toast.error("You must agree to the terms and conditions.");
    }
    
    setLoading(true);
    try {
      // Explicitly bundle config fields to match backend controller requirements exactly
      const finalPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        dob: formData.dob,
        agreedToTerms: formData.agreedToTerms,
        isAuthorisedProfessional: isLedByMedicalProf === true, 
        accountType: isLedByMedicalProf ? accountType : undefined
      };

      await API.post("/auth/register", finalPayload);
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
      background: '#fff',
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%', 
        maxWidth: '1100px', 
        background: '#fff', borderRadius: '16px',
        overflow: 'hidden', display: 'flex',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
      }}>

        {/* ── Content Panel ── */}
        <div style={{ flex: 1, padding: '56px 64px', boxSizing: 'border-box' }}>
          {step === 1 ? (
            <form onSubmit={handleNextAction}>
              
              {/* ── SUB-STEP 1: CHOICE & SCREENING INFOGRAPHICS ── */}
              {subStep === 1 && (
                <div>
                  <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.01em', marginBottom: '10px' }}>
                      Are you or do you work with a Registered UK Medical Professional?
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6' }}>
                      Please select if your company is healthcare professional led. This will help us determine what kind of Healthxchange account you require.
                    </p>
                  </div>

                  {/* Options Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', marginBottom: '40px' }}>
                    
                    {/* Option Box: YES */}
                    <div 
                      onClick={() => { setIsLedByMedicalProf(true); setAccountType("Prescriber"); }}
                      style={{
                        border: isLedByMedicalProf === true ? '2px solid #0f172a' : '1.5px solid #e2e8f0',
                        borderRadius: '14px', padding: '28px 24px', cursor: 'pointer', 
                        background: '#fff',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #0f172a',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px', flexShrink: 0
                        }}>
                          {isLedByMedicalProf === true && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0f172a' }} />}
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#0f172a', lineHeight: '1.4' }}>
                            Yes we are led by a Registered UK Medical Professional.
                          </h4>
                          <p style={{ margin: '0 0 16px 0', fontSize: '11px', color: '#64748b', fontWeight: '600', lineHeight: '1.5' }}>
                            I am a medical professional and/or the company has at least one registered UK medical professional that is one of the below.
                          </p>
                          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11.5px', color: '#475569', lineHeight: '1.8' }}>
                            <li>Doctor registered with the GMC</li>
                            <li>Dentist registered with the GDC</li>
                            <li>Nurse or Midwife registered with the NMC</li>
                            <li>Pharmacist Independent Prescriber registered with the GPHC or PSNI</li>
                            <li>Independent Prescriber registered with the HCPC</li>
                            <li>Dental Therapist registered with the GDC</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Option Box: NO */}
                    <div 
                      onClick={() => { setIsLedByMedicalProf(false); setAccountType("user"); }}
                      style={{
                        border: isLedByMedicalProf === false ? '2px solid #0f172a' : '1.5px solid #e2e8f0',
                        borderRadius: '14px', padding: '28px 24px', cursor: 'pointer', 
                        background: '#fff',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #cbd5e1',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px', flexShrink: 0
                        }}>
                          {isLedByMedicalProf === false && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0f172a' }} />}
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#0f172a', lineHeight: '1.4' }}>
                            No we are not led by a Registered UK Medical Professional.
                          </h4>
                          <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: '1.6' }}>
                            We currently have no registered UK medical professionals working within our company and wish to create a therapist account.
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* ── BEFORE YOU PROCEED CONDITIONAL INFOGRAPHICS ── */}
                  {isLedByMedicalProf === true && (
                    <div style={{ transition: 'all 0.3s ease-in-out' }}>
                      <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '18px' }}>
                        BEFORE YOU PROCEED...
                      </h3>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                        
                        {/* Card 1 */}
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                            <AlertCircle size={18} color="#0f172a" style={{ flexShrink: 0 }} />
                            <h5 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#0f172a', lineHeight: '1.4' }}>You must be one of the following:</h5>
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '13px', color: '#475569', lineHeight: '1.7' }}>
                            <li>A UK qualified prescriber.</li>
                            <li>You employ / work with a UK qualified prescriber.</li>
                            <li>You are a qualified HCP ordering Non Prescription items.</li>
                          </ul>
                        </div>

                        {/* Card 2 */}
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                            <FileText size={18} color="#0f172a" style={{ flexShrink: 0 }} />
                            <h5 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#0f172a', lineHeight: '1.4' }}>Prescribers will need:</h5>
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '13px', color: '#475569', lineHeight: '1.7', marginBottom: '12px' }}>
                            <li>A copy of their Passport or Drivers License*.</li>
                            <li>A mobile phone number.</li>
                            <li>An email address (must not be generic).</li>
                          </ul>
                          <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontStyle: 'italic', lineHeight: '1.5' }}>
                            *This information including Photo ID is essential for opening your account
                          </p>
                        </div>

                        {/* Card 3 */}
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px' }}>
                          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                            <User size={18} color="#0f172a" style={{ flexShrink: 0 }} />
                            <h5 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#0f172a', lineHeight: '1.4' }}>Photo ID must be:</h5>
                          </div>
                          <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '13px', color: '#475569', lineHeight: '1.7' }}>
                            <li>A valid Passport or Drivers License.</li>
                            <li>In colour.</li>
                            <li>Clear and in sharp focus.</li>
                            <li>Readable and not have any reflections obscuring the details.</li>
                            <li>Clearly showing name, signature and expiry date.</li>
                            <li>An image format (e.g. JPG, PNG), <strong style={{ color: '#0f172a' }}>not PDF</strong>.</li>
                          </ul>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* Navigation Control Toolbar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px' }}>
                    <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>
                      Already have an account?{' '}
                      <Link to="/login" style={{ color: '#0f172a', textDecoration: 'underline', fontWeight: '600' }}>
                        Sign In
                      </Link>
                    </p>
                    <button
                      type="submit"
                      style={{
                        padding: '14px 36px', background: '#0f172a', color: '#fff',
                        border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Confirm & Continue
                    </button>
                  </div>
                </div>
              )}

              {/* ── SUB-STEP 2: SPLIT LAYOUT TWO-COLUMN ACCOUNT REGISTRATION ── */}
              {subStep === 2 && (
                <div>
                  <div style={{ marginBottom: '32px' }}>
                    <button 
                      type="button" 
                      onClick={() => setSubStep(1)}
                      style={{
                        background: 'none', border: 'none', color: '#0f172a', fontSize: '12px',
                        fontWeight: '700', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px',
                        textDecoration: 'underline'
                      }}
                    >
                      &larr; Back to initial screening
                    </button>
                    <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
                      Create your Healthxchange account
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '12.5px', lineHeight: '1.6' }}>
                      We need to know a bit about you first so we can create your account. The email you enter below and the password you set on this screen will let you come back to finish your registration at any time. Once you complete and submit your registration for approval you will then receive a new Username and Password that you will use to access the e-pharmacy.
                    </p>
                  </div>

                  {/* Two Column Layout Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
                    
                    {/* Left Column: YOUR DETAILS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', margin: '0 0 4px 0' }}>
                        YOUR DETAILS
                      </h3>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                        <InputGroup label="Salutation" name="salutation" options={["Mr", "Mrs", "Ms", "Dr", "Prof"]} value={formData.salutation} onChange={handleChange("salutation")} required={false} />
                        <InputGroup label="First name" name="firstName" value={formData.firstName} onChange={handleChange("firstName")} />
                      </div>

                      <InputGroup label="Last name" name="lastName" value={formData.lastName} onChange={handleChange("lastName")} />
                      <InputGroup label="Email address" name="email" type="email" value={formData.email} onChange={handleChange("email")} />
                      <InputGroup label="Phone number" name="phoneNumber" placeholder="+44" value={formData.phoneNumber} onChange={handleChange("phoneNumber")} />
                      <InputGroup label="Home Address" name="address" value={formData.address} onChange={handleChange("address")} />
                      <InputGroup label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange("dob")} />
                    </div>

                    {/* Right Column: CREATE A PASSWORD & AGREEMENTS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <h3 style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px', margin: '0 0 4px 0' }}>
                        CREATE A PASSWORD
                      </h3>

                      <InputGroup label="Password" name="password" type="password" value={formData.password} onChange={handleChange("password")} />
                      <InputGroup label="Repeat Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange("confirmPassword")} />

                      <div style={{ border: '1px solid #e2e8f0', padding: '16px 20px', borderRadius: '10px', fontSize: '11.5px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontWeight: '700', color: '#0f172a' }}>Password requirements:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#0f172a' }} /> Minimum of 8 characters</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#0f172a' }} /> At least one uppercase letter</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#0f172a' }} /> At least one number</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#0f172a' }} /> At least one special character (e.g. ! % & ?)</div>
                      </div>

                      {/* System Agreements & Term Checklist Hooks */}
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '12px', color: '#334155', lineHeight: '1.5' }}>
                          <input type="checkbox" checked={formData.agreedToTerms} onChange={handleChange("agreedToTerms")} required style={{ marginTop: '3px', accentColor: '#0f172a' }} />
                          <span>I accept and agree to the website Terms of Use and Privacy Policy.</span>
                        </label>
                      </div>

                      {/* Action Submission Trigger */}
                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          width: '100%', marginTop: '16px', padding: '16px',
                          background: '#0f172a', color: '#fff', border: 'none',
                          borderRadius: '10px', fontSize: '13px', fontWeight: '700',
                          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1
                        }}
                      >
                        {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
                      </button>

                    </div>
                  </div>
                </div>
              )}

            </form>
          ) : (
            /* ── SECOND BLOCK CANVAS VIEW: TWO FACTOR OTP CODE ENTRY SCREEN ── */
            <div style={{ maxWidth: '440px', margin: '48px auto', textAlign: 'center' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '16px', border: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto'
              }}>
                <Lock size={26} color="#0f172a" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '10px' }}>
                Enter Security Code
              </h2>
              <p style={{ color: '#64748b', fontSize: '13.5px', lineHeight: 1.6, marginBottom: '32px' }}>
                We have sent a 6-digit confirmation code to <strong style={{ color: '#0f172a' }}>{formData.email}</strong>. Please enter the code below to complete confirmation.
              </p>

              <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '16px', border: '2px solid #e2e8f0',
                    borderRadius: '12px', fontSize: '22px', fontWeight: '700',
                    textAlign: 'center', letterSpacing: '0.3em', outline: 'none',
                    background: '#fff', transition: 'all 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = '#0f172a'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', padding: '16px', background: '#0f172a',
                    color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px',
                    fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Verifying Code...' : 'Verify & Activate Account'}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: 'none', border: 'none', color: '#64748b', fontSize: '12px',
                  fontWeight: '600', marginTop: '24px', cursor: 'pointer', textDecoration: 'underline'
                }}
              >
                Change email address or settings
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Register;