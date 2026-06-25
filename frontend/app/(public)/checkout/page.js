'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import GooglePayButton from '@google-pay/button-react';

// ---------- MERCHANT UPI DETAILS ----------
const MERCHANT_UPI_ID = "9816722750@axl";
const MERCHANT_NAME = "Face Product";

// ---------- Backend API base ----------
const API_BASE = 'http://localhost:5000';   // adjust to your backend port

// ---------- Searchable Select (fully implemented) ----------
const SearchableSelect = ({ options, value, onChange, placeholder, disabled = false, loading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
    if (value) onChange('');
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        e.preventDefault();
        break;
      case 'ArrowUp':
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : -1));
        e.preventDefault();
        break;
      case 'Enter':
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else if (filteredOptions.length === 1) {
          handleSelect(filteredOptions[0]);
        }
        e.preventDefault();
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      setSearchTerm(value);
    } else {
      setSearchTerm('');
    }
  }, [value]);

  const displayValue = value || searchTerm;

  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
        disabled={disabled || loading}
        placeholder={loading ? 'Loading...' : placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition text-gray-900 disabled:bg-gray-100"
      />
      {isOpen && filteredOptions.length > 0 && !disabled && !loading && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredOptions.map((opt, idx) => (
            <li
              key={opt}
              className={`px-3 py-2 cursor-pointer text-sm text-gray-900 hover:bg-gray-100 ${
                idx === highlightedIndex ? 'bg-gray-100' : ''
              }`}
              onClick={() => handleSelect(opt)}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
      {isOpen && filteredOptions.length === 0 && !disabled && !loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 text-sm text-gray-900">
          No options found
        </div>
      )}
    </div>
  );
};

// ---------- MAIN CHECKOUT COMPONENT ----------
export default function CheckoutPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    state: '',
    city: '',
    houseNo: '',
    street: '',
    pincode: '',
    isDefault: false,
    paymentMethod: 'card',
    card: '',
    expiry: '',
    cvc: '',
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [errors, setErrors] = useState({});
  const [total, setTotal] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [selectedUpiMethod, setSelectedUpiMethod] = useState('qr');
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  // ---------- OTP State ----------
  const [otp, setOtp] = useState({
    sent: false,
    verified: false,
    value: '',
    loading: false,
    error: '',
    resendCooldown: 0,
  });
  const [otpEmail, setOtpEmail] = useState('');

  // ---------- Fetch countries and cart ----------
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('https://countriesnow.space/api/v0.1/countries');
        const data = await res.json();
        if (data.data) {
          const countryNames = data.data.map(c => c.country).sort();
          setCountries(countryNames);
        }
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };
    fetchCountries();

    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const cart = JSON.parse(storedCart);
        setCartItems(cart);
        const sub = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setSubtotal(sub);
        const shipping = sub > 50 ? 0 : 5.99;
        setShippingCost(shipping);
        setTotal(sub + shipping);
      } catch (e) {
        setTotal(49.99);
      }
    } else {
      setTotal(49.99);
    }
  }, []);

  // ---------- Reset OTP if email changes ----------
  useEffect(() => {
    if (otp.sent && otpEmail && form.email && otpEmail !== form.email) {
      setOtp({
        sent: false,
        verified: false,
        value: '',
        loading: false,
        error: '',
        resendCooldown: 0,
      });
      setOtpEmail('');
    }
  }, [form.email, otpEmail, otp.sent]);

  // ---------- Handlers ----------
  const handleFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCountryChange = async (selectedCountry) => {
    setForm(prev => ({ ...prev, country: selectedCountry, state: '', city: '' }));
    setStates([]);
    setCities([]);
    if (!selectedCountry) return;
    setLoadingStates(true);
    try {
      const res = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: selectedCountry }),
      });
      const data = await res.json();
      if (data.data?.states) {
        const stateNames = data.data.states.map(s => s.name).sort();
        setStates(stateNames);
      }
    } catch (err) { console.error(err); }
    finally { setLoadingStates(false); }
  };

  const handleStateChange = async (selectedState) => {
    setForm(prev => ({ ...prev, state: selectedState, city: '' }));
    setCities([]);
    if (!selectedState || !form.country) return;
    setLoadingCities(true);
    try {
      const res = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: form.country, state: selectedState }),
      });
      const data = await res.json();
      if (data.data) setCities(data.data.sort());
    } catch (err) { console.error(err); }
    finally { setLoadingCities(false); }
  };

  const handlePaymentMethodChange = (e) => {
    setForm(prev => ({ ...prev, paymentMethod: e.target.value }));
    if (e.target.value !== 'upi') setSelectedUpiMethod('qr');
  };

  // ---------- Validation ----------
  const validateForm = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!form.country) newErrors.country = 'Select a country';
    if (!form.state) newErrors.state = 'Select a state';
    if (!form.city) newErrors.city = 'Select a city';
    if (!form.houseNo.trim()) newErrors.houseNo = 'House/Flat no. required';
    if (!form.street.trim()) newErrors.street = 'Street address required';
    if (!form.pincode.trim()) newErrors.pincode = 'Pincode required';
    else if (!/^\d{5,6}$/.test(form.pincode)) newErrors.pincode = 'Pincode must be 5-6 digits';

    if (form.paymentMethod === 'card') {
      if (!form.card.trim()) newErrors.card = 'Card number required';
      else if (!/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(form.card.replace(/\s/g, '')))
        newErrors.card = 'Invalid card number';
      if (!form.expiry.trim()) newErrors.expiry = 'Expiry required';
      else if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(form.expiry))
        newErrors.expiry = 'Use MM/YY';
      if (!form.cvc.trim()) newErrors.cvc = 'CVC required';
      else if (!/^\d{3,4}$/.test(form.cvc)) newErrors.cvc = 'CVC must be 3-4 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------- OTP Functions ----------
  const sendOtp = async () => {
    if (!form.email) {
      setOtp(prev => ({ ...prev, error: 'Please enter your email address.' }));
      return;
    }
    setOtp(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const res = await fetch(`${API_BASE}/api/otp/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtp(prev => ({
          ...prev,
          sent: true,
          verified: false,
          loading: false,
          value: '',
          error: '',
        }));
        setOtpEmail(form.email);
        setOtp(prev => ({ ...prev, resendCooldown: 60 }));
        const interval = setInterval(() => {
          setOtp(prev => {
            if (prev.resendCooldown <= 1) {
              clearInterval(interval);
              return { ...prev, resendCooldown: 0 };
            }
            return { ...prev, resendCooldown: prev.resendCooldown - 1 };
          });
        }, 1000);
      } else {
        setOtp(prev => ({ ...prev, loading: false, error: data.error || 'Failed to send OTP.' }));
      }
    } catch {
      setOtp(prev => ({ ...prev, loading: false, error: 'Network error. Please try again.' }));
    }
  };

  const verifyOtp = async () => {
    if (otp.value.length !== 6) {
      setOtp(prev => ({ ...prev, error: 'Enter a 6‑digit OTP.' }));
      return;
    }
    setOtp(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const res = await fetch(`${API_BASE}/api/otp/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp: otp.value }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtp(prev => ({ ...prev, verified: true, loading: false, error: '' }));
      } else {
        setOtp(prev => ({ ...prev, loading: false, error: data.error || 'Invalid OTP.' }));
      }
    } catch {
      setOtp(prev => ({ ...prev, loading: false, error: 'Network error. Please try again.' }));
    }
  };

  // ---------- Save order to DATABASE ----------
  const saveOrderToHistory = async (paymentMethod) => {
    try {
      const payload = {
        userEmail: form.email,
        shipping: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          houseNo: form.houseNo,
          street: form.street,
          city: form.city,
          state: form.state,
          country: form.country,
          pincode: form.pincode,
        },
        items: JSON.parse(localStorage.getItem('cart') || '[]'),
        total: total,
        paymentMethod: paymentMethod,
      };

      const res = await fetch(`${API_BASE}/api/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cart-updated'));
        setOrderPlaced(true);
        return true;
      } else {
        alert(data.error || 'Order submission failed. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Order save error:', error);
      alert('Network error. Please check your connection.');
      return false;
    }
  };

  // ---------- Google Pay success ----------
  const handleGooglePaySuccess = async (paymentData) => {
    if (!otp.verified) {
      alert('Please verify your email before using Google Pay.');
      return;
    }
    const paymentToken = paymentData.paymentMethodData.tokenizationData.token;
    setIsPaymentProcessing(true);
    try {
      const response = await fetch(`${API_BASE}/api/process-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: paymentToken, total }),
      });
      const result = await response.json();
      if (result.success) {
        await saveOrderToHistory('Google Pay');
      } else {
        alert(result.error || 'Payment failed');
      }
    } catch (err) {
      console.error(err);
      alert('Payment processing error');
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  // ---------- Submit handler ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp.verified) {
      alert('Please verify your email before placing the order.');
      return;
    }

    if (form.paymentMethod === 'google_pay') {
      alert('Please complete payment using the Google Pay button above.');
      return;
    }

    if (!validateForm()) return;

    let paymentMethod = '';
    if (form.paymentMethod === 'cod') paymentMethod = 'Cash on Delivery';
    else if (form.paymentMethod === 'card') paymentMethod = 'Credit/Debit Card';
    else paymentMethod = 'UPI QR';

    await saveOrderToHistory(paymentMethod);
  };

  // ---------- Order success ----------
  if (orderPlaced) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-4 py-20">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-900 text-sm mb-6">Thank you. Your order has been saved to our database.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/products" className="inline-block bg-black text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-900 transition">
              Continue Shopping
            </Link>
            <Link href="/orders" className="inline-block bg-white border border-black text-black px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-100 transition">
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Main form ----------
  return (
    <div className="bg-white min-h-screen py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <div className="bg-gray-50 p-5 sm:p-6 rounded-2xl border border-gray-200">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Shipping Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-900 mb-1">Full Name *</label>
                    <input name="fullName" value={form.fullName} onChange={handleFieldChange} placeholder="John Doe" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-gray-900" />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1">Email *</label>
                    <input name="email" type="email" value={form.email} onChange={handleFieldChange} placeholder="john@example.com" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-gray-900" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1">Phone *</label>
                    <input name="phone" value={form.phone} onChange={handleFieldChange} placeholder="+1234567890" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-gray-900" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1">Country *</label>
                    <SearchableSelect options={countries} value={form.country} onChange={handleCountryChange} placeholder="Type or select country..." disabled={countries.length === 0} loading={countries.length === 0} />
                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1">State *</label>
                    <SearchableSelect options={states} value={form.state} onChange={handleStateChange} placeholder={!form.country ? "Select country first" : "Type or select state..."} disabled={!form.country || loadingStates} loading={loadingStates} />
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1">City *</label>
                    <SearchableSelect options={cities} value={form.city} onChange={(selectedCity) => setForm(prev => ({ ...prev, city: selectedCity }))} placeholder={!form.state ? "Select state first" : "Type or select city..."} disabled={!form.state || loadingCities} loading={loadingCities} />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1">House/Flat No. *</label>
                    <input name="houseNo" value={form.houseNo} onChange={handleFieldChange} placeholder="123, Building A" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-gray-900" />
                    {errors.houseNo && <p className="text-red-500 text-xs mt-1">{errors.houseNo}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-900 mb-1">Street Address *</label>
                    <input name="street" value={form.street} onChange={handleFieldChange} placeholder="123 Main St" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-gray-900" />
                    {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1">Pincode *</label>
                    <input name="pincode" value={form.pincode} onChange={handleFieldChange} placeholder="10001" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-gray-900" />
                    {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleFieldChange} id="defaultAddress" className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black" />
                    <label htmlFor="defaultAddress" className="text-xs text-gray-900">Set as default address</label>
                  </div>
                </div>
              </div>

              {/* OTP Verification */}
              <div className="bg-gray-50 p-5 sm:p-6 rounded-2xl border border-gray-200">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Verify Your Email</h2>
                {!otp.sent ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={sendOtp}
                      disabled={!form.email || otp.loading}
                      className="px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-900 disabled:opacity-50 transition"
                    >
                      {otp.loading ? 'Sending...' : 'Send OTP'}
                    </button>
                    <span className="text-sm text-gray-900">
                      We'll send a code to <strong>{form.email || 'your email'}</strong>
                    </span>
                    {otp.error && <span className="text-red-500 text-sm w-full mt-1">{otp.error}</span>}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <input
                        type="text"
                        value={otp.value}
                        onChange={(e) => setOtp(prev => ({ ...prev, value: e.target.value, error: '' }))}
                        placeholder="Enter 6-digit OTP"
                        className="w-40 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-gray-900"
                        maxLength="6"
                      />
                      <button
                        type="button"
                        onClick={verifyOtp}
                        disabled={otp.loading || otp.value.length !== 6}
                        className="px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-900 disabled:opacity-50 transition"
                      >
                        {otp.loading ? 'Verifying...' : 'Verify'}
                      </button>
                      {otp.verified && (
                        <span className="text-green-600 text-sm font-semibold">✅ Verified!</span>
                      )}
                      {otp.error && <span className="text-red-500 text-sm">{otp.error}</span>}
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={sendOtp}
                        disabled={otp.loading || otp.resendCooldown > 0}
                        className="text-xs text-gray-900 underline hover:text-black disabled:opacity-50 transition"
                      >
                        {otp.resendCooldown > 0
                          ? `Resend in ${otp.resendCooldown}s`
                          : 'Resend OTP'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Section (only when OTP verified) */}
              {otp.verified ? (
                <>
                  <div className="bg-gray-50 p-5 sm:p-6 rounded-2xl border border-gray-200">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Payment Details</h2>
                    <div className="mb-4 space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="paymentMethod" value="card" checked={form.paymentMethod === 'card'} onChange={handlePaymentMethodChange} className="w-4 h-4 text-black border-gray-300 focus:ring-black" />
                        <span className="text-sm text-gray-900">Credit / Debit Card</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="paymentMethod" value="upi" checked={form.paymentMethod === 'upi'} onChange={handlePaymentMethodChange} className="w-4 h-4 text-black border-gray-300 focus:ring-black" />
                        <span className="text-sm text-gray-900">UPI (QR / Google Pay)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="paymentMethod" value="cod" checked={form.paymentMethod === 'cod'} onChange={handlePaymentMethodChange} className="w-4 h-4 text-black border-gray-300 focus:ring-black" />
                        <span className="text-sm text-gray-900">Cash on Delivery</span>
                      </label>
                    </div>

                    {/* UPI Section */}
                    {form.paymentMethod === 'upi' && (
                      <div className="space-y-4">
                        <p className="text-sm font-medium text-gray-900">Choose how to pay:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* QR Code */}
                          <div
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              selectedUpiMethod === 'qr' ? 'border-black bg-gray-100' : 'border-gray-300 hover:border-black'
                            }`}
                            onClick={() => setSelectedUpiMethod('qr')}
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <input type="radio" checked={selectedUpiMethod === 'qr'} onChange={() => setSelectedUpiMethod('qr')} className="w-4 h-4 text-black border-gray-300 focus:ring-black" />
                              <label className="text-sm font-medium text-gray-900 cursor-pointer">Scan QR Code</label>
                            </div>
                            {selectedUpiMethod === 'qr' && (
                              <div className="flex justify-center mt-3">
                                <div className="bg-white p-3 rounded-lg inline-block">
                                  <QRCodeSVG
                                    value={`upi://pay?pa=${encodeURIComponent(MERCHANT_UPI_ID)}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${total.toFixed(2)}&cu=INR`}
                                    size={180}
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                    level="L"
                                    includeMargin={true}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Google Pay */}
                          <div
                            className={`border rounded-lg p-4 cursor-pointer transition-all ${
                              selectedUpiMethod === 'app' ? 'border-black bg-gray-100' : 'border-gray-300 hover:border-black'
                            }`}
                            onClick={() => setSelectedUpiMethod('app')}
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <input type="radio" checked={selectedUpiMethod === 'app'} onChange={() => setSelectedUpiMethod('app')} className="w-4 h-4 text-black border-gray-300 focus:ring-black" />
                              <label className="text-sm font-medium text-gray-900 cursor-pointer">Pay with Google Pay (Gateway)</label>
                            </div>
                            {selectedUpiMethod === 'app' && (
                              <div className="flex justify-center mt-2">
                                <GooglePayButton
                                  environment="TEST"
                                  paymentRequest={{
                                    apiVersion: 2,
                                    apiVersionMinor: 0,
                                    allowedPaymentMethods: [{
                                      type: 'CARD',
                                      parameters: {
                                        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                                        allowedCardNetworks: ['MASTERCARD', 'VISA'],
                                      },
                                      tokenizationSpecification: {
                                        type: 'PAYMENT_GATEWAY',
                                        parameters: {
                                          gateway: 'example',
                                          gatewayMerchantId: 'exampleGatewayMerchantId',
                                        },
                                      },
                                    }],
                                    merchantInfo: {
                                      merchantId: '01234567890123456789',
                                      merchantName: MERCHANT_NAME,
                                    },
                                    transactionInfo: {
                                      totalPriceStatus: 'FINAL',
                                      totalPriceLabel: 'Total',
                                      totalPrice: total.toFixed(2),
                                      currencyCode: 'INR',
                                      countryCode: 'IN',
                                    },
                                  }}
                                  onLoadPaymentData={handleGooglePaySuccess}
                                  onError={(error) => console.error('Google Pay error', error)}
                                  buttonType="buy"
                                  buttonColor="black"
                                  buttonLocale="en"
                                  buttonSizeMode="fill"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Card Fields */}
                    {form.paymentMethod === 'card' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-900 mb-1">Card Number *</label>
                          <input name="card" value={form.card} onChange={handleFieldChange} placeholder="1234 5678 9012 3456" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-gray-900" />
                          {errors.card && <p className="text-red-500 text-xs mt-1">{errors.card}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-900 mb-1">Expiry (MM/YY) *</label>
                            <input name="expiry" value={form.expiry} onChange={handleFieldChange} placeholder="MM/YY" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-gray-900" />
                            {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-900 mb-1">CVC *</label>
                            <input name="cvc" value={form.cvc} onChange={handleFieldChange} placeholder="123" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-gray-900" />
                            {errors.cvc && <p className="text-red-500 text-xs mt-1">{errors.cvc}</p>}
                          </div>
                        </div>
                      </div>
                    )}

                    {form.paymentMethod === 'cod' && (
                      <div className="text-sm text-gray-900">
                        Pay when you receive your order. No online payment required.
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isPaymentProcessing}
                    className="w-full bg-black text-white py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 hover:bg-gray-900 hover:scale-[1.02] active:scale-98 hover:shadow-lg disabled:opacity-50"
                  >
                    {isPaymentProcessing ? "Processing..." : "Place Order"}
                  </button>
                </>
              ) : (
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 text-center text-gray-900">
                  {otp.sent
                    ? 'Please enter the OTP sent to your email and verify to proceed with payment.'
                    : 'Please send an OTP to your email to verify before payment.'}
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-6">
              <h2 className="text-base font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                {cartItems.length === 0 ? (
                  <p className="text-sm text-gray-900">Your cart is empty.</p>
                ) : (
                  <>
                    {cartItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-900">{item.name} × {item.quantity}</span>
                        <span className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <hr className="border-gray-300" />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-900">Subtotal</span>
                      <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-900">Shipping</span>
                      <span className="font-medium text-gray-900">${shippingCost.toFixed(2)}</span>
                    </div>
                    <hr className="border-gray-300" />
                    <div className="flex justify-between font-bold text-base">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">${total.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}