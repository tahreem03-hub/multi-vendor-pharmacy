import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Login              from './pages/Login';
import Register           from './pages/Register';
import Home               from './pages/Home';
import CartPage           from './pages/CartPage';
import PrescriberLayout    from './pages/PrescriberLayout';
import TrendPro           from './pages/TrendPro';
import ProductDetails     from './pages/ProductDetails';
import PrescriberLink     from './pages/PrescriberLink';
import PrescriptionForm   from './pages/Prescription-form';
import PrescriptionsPage  from './pages/PrescriptionsPage';
import Injectable         from './pages/Injectable';
import About              from './components/About';
import Contact            from './components/Contact';
import MediaManager       from './components/MediaManager';
import PrescriberPosts    from './components/PrescriberPosts';
import Skincare           from './pages/Skincare';
import SliderManager      from './components/SliderManager';
import Header             from './components/Header';
import Footer             from './components/Footer';

import './App.css';

const PrescriberRoute = ({ children }) => {
  const { isLoggedIn, isPrescriber } = useAuth();
  if (!isLoggedIn || !isPrescriber) return <Navigate to="/login" replace />;
  return children;
};

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
};

const MainLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-white text-black">
    <Header />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

const AuthLayout = ({ children }) => (
  <div className="min-h-screen bg-white">
    {children}
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* ── Public — WITH header/footer ── */}
      <Route path="/"            element={<MainLayout><Home /></MainLayout>} />
      <Route path="/about"       element={<MainLayout><About /></MainLayout>} />
      <Route path="/contact"     element={<MainLayout><Contact /></MainLayout>} />
      <Route path="/injectables" element={<MainLayout><Injectable /></MainLayout>} />
      <Route path="/Skincare"    element={<MainLayout><Skincare /></MainLayout>} />
      <Route path="/product/:id" element={<MainLayout><ProductDetails /></MainLayout>} />

      {/* ── Auth pages — NO header/footer ── */}
      <Route path="/login"    element={<AuthLayout><Login /></AuthLayout>} />
      <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />

      {/* ── Protected — WITH header/footer ── */}
      <Route path="/cart" element={
        <ProtectedRoute>
          <MainLayout><CartPage /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/prescription-form" element={
        <ProtectedRoute>
          <MainLayout><PrescriptionForm /></MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/prescriptions" element={
        <ProtectedRoute>
          <MainLayout><PrescriptionsPage /></MainLayout>
        </ProtectedRoute>
      } />
      

      {/* ── Prescriber only — WITH header/footer ── */}
      <Route path="/trendpro" element={
        <PrescriberRoute>
          <MainLayout><TrendPro isHomePage={false} /></MainLayout>
        </PrescriberRoute>
      } />
      <Route path="/prescriber-link" element={
        <PrescriberRoute>
          <MainLayout><PrescriberLink /></MainLayout>
        </PrescriberRoute>
      } />
      <Route path="/media-manager" element={
        <PrescriberRoute>
          <MainLayout><MediaManager /></MainLayout>
        </PrescriberRoute>
      } />
      <Route path="/prescriber-posts" element={
        <PrescriberRoute>
          <MainLayout><PrescriberPosts /></MainLayout>
        </PrescriberRoute>
      } />

      {/* ── Dashboard — NO header/footer ── */}
      <Route path="/dashboard" element={
        <PrescriberRoute>
          <PrescriberLayout />
        </PrescriberRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <div className="app-container">
          <Toaster position="top-center" reverseOrder={false} />
          <AppRoutes />
        </div>
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;