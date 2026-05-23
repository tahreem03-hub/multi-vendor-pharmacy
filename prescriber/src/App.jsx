import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CartPage from './pages/CartPage';
import PrescriberLayout from './pages/PrescriberLayout';
import TrendPro from './pages/TrendPro';
import ProductDetails from './pages/ProductDetails';
import PrescriptionDetailed from './pages/PrescriptionDetialed';
import PrescriberLink from './pages/PrescriberLink';
import PrescriptionForm from './pages/Prescription-form';
import PrescriptionsPage from './pages/PrescriptionsPage';
import Injectable from './pages/Injectable';
import About from './components/About';
import Contact from './components/Contact'; // Fixed: Capitalized import

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import SliderManager from './components/SliderManager';
import MediaManager from './components/MediaManager';
import PrescriberPosts from './components/PrescriberPosts'; 

import './App.css';
import Skincare from './pages/Skincare';

// ── Route Guard ───────────────────────────────────────────────
const PrescriberRoute = ({ children }) => {
  const { isLoggedIn, isPrescriber } = useAuth();
  if (!isLoggedIn || !isPrescriber) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// ── Main Layout ───────────────────────────────────────────────
const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

// ── Routes ────────────────────────────────────────────
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/about" element={<MainLayout><About /></MainLayout>} />
      <Route path='/contact' element={<MainLayout><Contact /></MainLayout>} /> {/* Fixed: Capitalized tag */}
      <Route path="/injectables" element={<MainLayout><Injectable /></MainLayout>} />
      <Route path="/Skincare" element={<MainLayout><Skincare/></MainLayout>} />
      <Route path="/product/:id" element={<MainLayout><ProductDetails /></MainLayout>} />
      <Route path="/cart" element={<MainLayout><CartPage /></MainLayout>} />
      <Route path="/prescription-form" element={<MainLayout><PrescriptionForm /></MainLayout>} />
      
      {/* Prescriber Only Routes */}
      <Route path="/trendpro" element={<PrescriberRoute><MainLayout><TrendPro isHomePage={false} /></MainLayout></PrescriberRoute>} />
      <Route path="/prescriptions" element={<MainLayout><PrescriptionsPage /></MainLayout>} />
      <Route path="/prescriber-link" element={<PrescriberRoute><MainLayout><PrescriberLink /></MainLayout></PrescriberRoute>} />
      <Route path="/prescription-detail/:id" element={<PrescriberRoute><MainLayout><PrescriptionDetailed /></MainLayout></PrescriberRoute>} />
      
      {/* Media & Posts Manager Routes */}
      <Route path="/media-manager" element={<PrescriberRoute><MainLayout><MediaManager /></MainLayout></PrescriberRoute>} />
      <Route path="/prescriber-posts" element={<PrescriberRoute><MainLayout><PrescriberPosts /></MainLayout></PrescriberRoute>} />

      {/* Dashboard Route */}
      <Route path="/dashboard" element={<PrescriberRoute><PrescriberLayout /></PrescriberRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// ── App Component ─────────────────────────────────────────────
const App = () => {
  return (
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
};

export default App;