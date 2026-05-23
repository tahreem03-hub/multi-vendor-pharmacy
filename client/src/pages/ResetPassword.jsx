import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from 'react-hot-toast';
import API from "../api/axios";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error("Passwords must match");
    
    setLoading(true);
    try {
      await API.post(`/auth/reset-password/${token}`, { password });
      toast.success("Security credentials updated");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Session expired or invalid");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper font-sans">
      <div className="auth-card">
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Set New Password</h1>
          <p className="text-zinc-500 text-sm mt-1">Choose a secure password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-widest">New Password</label>
            <input 
              type="password" required placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              className="modern-input"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-widest">Confirm Password</label>
            <input 
              type="password" required placeholder="••••••••"
              value={confirm} onChange={e => setConfirm(e.target.value)}
              className="modern-input"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? "Updating..." : "Update Credentials"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;