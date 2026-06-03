import { useState } from "react";
import { Link } from "react-router-dom";
import toast from 'react-hot-toast';
import API from "../api/axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/auth/forgot-password", { email });
      toast.success(data.message || "Recovery link sent to your inbox");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper font-sans">
      <div className="auth-card">
        <div className="mb-10 text-center">
          <div className="w-12 h-12 bg-zinc-800 rounded-2xl mx-auto mb-6 flex items-center justify-center border border-zinc-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Recover Password</h1>
          <p className="text-zinc-500 text-sm mt-1">We'll send a recovery link to your email.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-widest">Registered Email</label>
            <input 
              type="email" required placeholder="name@domain.com"
              value={email} onChange={e => setEmail(e.target.value)}
              className="modern-input"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Sending..." : "Send Recovery Link"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="text-sm font-medium text-zinc-500 hover:text-white transition-colors">
            ← Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;