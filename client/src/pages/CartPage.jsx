import { useEffect, useState } from "react";
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const CartPage = () => {
  const { cart, removeFromCart, refreshCart, clearCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [removing, setRemoving]         = useState(null);
  const [mounted, setMounted]           = useState(false);
  const [checkingOut, setCheckingOut]   = useState(false);
  const [prescribers, setPrescribers]   = useState([]);
  const [prescriberId, setPrescriberId] = useState('');
  const [deliveryAddress, setDelivery]  = useState({ line1: '', city: '', postcode: '' });

  const items     = cart?.items || [];
  const subtotal  = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    refreshCart();
    setTimeout(() => setMounted(true), 100);
    fetchPrescribers();
  }, []);

  const fetchPrescribers = async () => {
    try {
      // FIX: /prescriber/active-links — matches app.use("/api/prescriber", prescriberRoutes)
      const { data } = await API.get('/prescriber/active-links');
      const links = Array.isArray(data) ? data : data.links || [];
      setPrescribers(links);

      if (links.length === 1) {
        const customId = links[0].prescriberId?.prescriberId || '';
        setPrescriberId(customId);
      }
    } catch (err) {
      console.error('Failed to fetch prescribers:', err);
    }
  };

  const handleRemove = async (productId) => {
    setRemoving(productId);
    await removeFromCart(productId);
    setRemoving(null);
  };

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      toast.error('Please log in to checkout');
      navigate('/login');
      return;
    }
    if (!prescriberId) {
      toast.error('Please select a prescriber');
      return;
    }
    if (!deliveryAddress.line1 || !deliveryAddress.city || !deliveryAddress.postcode) {
      toast.error('Please enter your delivery address');
      return;
    }

    setCheckingOut(true);
    try {
      const orderItems = items.map(item => ({
        medicineId: item.productId,
        quantity:   item.quantity,
      }));

      await API.post('/orders', {
        prescriberId,
        items: orderItems,
        deliveryAddress,
      });

      toast.success('Order placed successfully!');
      await clearCart();
      navigate('/home');
    } catch (err) {
      const message = err.response?.data?.message || 'Server connection error';
      toast.error(message);
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafb', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}>

      <div style={{
        borderBottom: '1px solid #e8ecef', background: '#fff',
        padding: '16px 40px', display: 'flex', alignItems: 'center', gap: '12px'
      }}>
        <Link to="/home" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={14} /> Back to Shop
        </Link>
        <span style={{ color: '#d1d5db' }}>·</span>
        <span style={{ color: '#111', fontSize: '13px', fontWeight: '600' }}>Cart</span>
      </div>

      <div style={{ maxWidth: '1040px', margin: '0 auto', padding: '48px 24px' }}>

        <div style={{
          marginBottom: '36px',
          opacity:    mounted ? 1 : 0,
          transform:  mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.5s ease'
        }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>Shopping Cart</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            {items.length === 0 ? 'Your cart is empty' : `${itemCount} item${itemCount !== 1 ? 's' : ''} in your cart`}
          </p>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 40px', background: '#fff', borderRadius: '20px', border: '1px solid #e8ecef' }}>
            <Package size={48} color="#94a3b8" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>Your cart is empty</h2>
            <Link to="/home" style={{ marginTop: '20px', display: 'inline-block', background: '#0f172a', color: 'white', padding: '12px 24px', borderRadius: '10px', textDecoration: 'none' }}>
              Shop Now
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {items.map((item) => (
                <div key={item.productId} style={{
                  background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #e8ecef',
                  display: 'flex', alignItems: 'center', gap: '16px'
                }}>
                  <div style={{ width: '60px', height: '60px', background: '#f1f5f9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    📦
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: '700', margin: 0 }}>{item.name}</h3>
                    <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0' }}>Qty: {item.quantity}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: '800', margin: '0 0 4px' }}>£{(item.price * item.quantity).toFixed(2)}</p>
                    <button
                      onClick={() => handleRemove(item.productId)}
                      disabled={removing === item.productId}
                      style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                    >
                      {removing === item.productId ? '...' : 'Remove'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e8ecef', height: 'fit-content' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Summary</h2>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                  LINKED PRESCRIBER
                </label>
                {prescribers.length === 0 ? (
                  <div style={{ padding: '12px', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', fontSize: '12px' }}>
                    No links found. <Link to="/prescriberLink" style={{ color: '#b45309', fontWeight: '700' }}>Link now →</Link>
                  </div>
                ) : (
                  <select
                    value={prescriberId}
                    onChange={e => setPrescriberId(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}
                  >
                    <option value="">Select a prescriber</option>
                    {prescribers.map((p, idx) => {
                      const customId = p.prescriberId?.prescriberId || '';
                      const fullName = p.prescriberId?.name ||
                        `${p.prescriberId?.firstName || ''} ${p.prescriberId?.lastName || ''}`.trim();
                      return (
                        <option key={idx} value={customId}>
                          {fullName}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                  DELIVERY ADDRESS
                </label>
                <input
                  placeholder="Address Line 1"
                  value={deliveryAddress.line1}
                  onChange={e => setDelivery({ ...deliveryAddress, line1: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '8px', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input
                    placeholder="City"
                    value={deliveryAddress.city}
                    onChange={e => setDelivery({ ...deliveryAddress, city: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
                  />
                  <input
                    placeholder="Postcode"
                    value={deliveryAddress.postcode}
                    onChange={e => setDelivery({ ...deliveryAddress, postcode: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b', fontSize: '13px' }}>Subtotal</span>
                <span style={{ fontSize: '13px' }}>£{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <span style={{ color: '#64748b', fontSize: '13px' }}>Delivery</span>
                <span style={{ fontSize: '13px' }}>£5.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontWeight: '700' }}>Total</span>
                <span style={{ fontWeight: '800', fontSize: '18px' }}>£{(subtotal + 5).toFixed(2)}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                style={{
                  width: '100%', padding: '14px', background: '#0f172a', color: 'white',
                  border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer',
                  opacity: checkingOut ? 0.7 : 1, fontSize: '15px'
                }}
              >
                {checkingOut ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;