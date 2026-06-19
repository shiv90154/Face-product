'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import GooglePayButton from '@google-pay/button-react';

// ---------- MERCHANT UPI DETAILS ----------
const MERCHANT_UPI_ID = "9816722750@axl";
const MERCHANT_NAME = "Face Product";

// ---------- Searchable Select Component ----------
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
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition text-gray-900 disabled:bg-gray-100"
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
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-2 text-sm text-gray-500">
          No options found
        </div>
      )}
    </div>
  );
};

// ---------- Main Checkout Component ----------
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
  const [selectedUpiMethod, setSelectedUpiMethod] = useState('qr');
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  // Fetch countries and cart total
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
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 50 ? 0 : 5.99;
        setTotal(subtotal + shipping);
      } catch (e) {
        setTotal(49.99);
      }
    } else {
      setTotal(49.99);
    }
  }, []);

  // ✅ Helper: save order and clear cart with event dispatch
  const saveOrderToHistory = (orderData) => {
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const newOrder = {
      id: Date.now().toString(),
      orderDate: new Date().toISOString(),
      ...orderData,
      status: 'Confirmed',
    };
    existingOrders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(existingOrders));
    // Clear cart after order
    localStorage.removeItem('cart');
    // ✅ Dispatch event to update header and cart page
    window.dispatchEvent(new Event('cart-updated'));
  };

  // Handlers
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

  // Validation
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

  // Google Pay success handler
  const handleGooglePaySuccess = async (paymentData) => {
    const paymentToken = paymentData.paymentMethodData.tokenizationData.token;
    setIsPaymentProcessing(true);
    try {
      const response = await fetch('/api/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: paymentToken, total }),
      });
      const result = await response.json();
      if (result.success) {
        saveOrderToHistory({
          shipping: {
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
            address: `${form.houseNo}, ${form.street}, ${form.city}, ${form.state}, ${form.country} - ${form.pincode}`,
          },
          paymentMethod: 'Google Pay',
          total: total,
          items: JSON.parse(localStorage.getItem('cart') || '[]'),
        });
        setOrderPlaced(true);
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

  // Submit handler for card/COD
  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.paymentMethod === 'google_pay') {
      alert('Please complete payment using the Google Pay button above.');
      return;
    }
    if (!validateForm()) return;

    if (form.paymentMethod === 'cod' || form.paymentMethod === 'card') {
      saveOrderToHistory({
        shipping: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          address: `${form.houseNo}, ${form.street}, ${form.city}, ${form.state}, ${form.country} - ${form.pincode}`,
        },
        paymentMethod: form.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit/Debit Card',
        total: total,
        items: JSON.parse(localStorage.getItem('cart') || '[]'),
      });
      setOrderPlaced(true);
    } else {
      console.log('Order placed (non-Google Pay):', { ...form, total });
      setOrderPlaced(true);
    }
  };

  // Order success screen
  if (orderPlaced) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-4 py-20">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-sm text-gray-600 mb-6">Thank you. You'll receive a confirmation email shortly.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/products" className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-black transition">
              Continue Shopping
            </Link>
            <Link href="/orders" className="inline-block bg-white border border-gray-900 text-gray-900 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-100 transition">
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="bg-white min-h-screen py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shipping Information */}
          <div className="bg-gray-50 p-5 sm:p-6 rounded-2xl border border-gray-200">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Shipping Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-900 mb-1">Full Name *</label>
                <input name="fullName" value={form.fullName} onChange={handleFieldChange} placeholder="John Doe" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 text-gray-900" />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleFieldChange} placeholder="john@example.com" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 text-gray-900" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">Phone *</label>
                <input name="phone" value={form.phone} onChange={handleFieldChange} placeholder="+1234567890" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 text-gray-900" />
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
                <input name="houseNo" value={form.houseNo} onChange={handleFieldChange} placeholder="123, Building A" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 text-gray-900" />
                {errors.houseNo && <p className="text-red-500 text-xs mt-1">{errors.houseNo}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-900 mb-1">Street Address *</label>
                <input name="street" value={form.street} onChange={handleFieldChange} placeholder="123 Main St" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 text-gray-900" />
                {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">Pincode *</label>
                <input name="pincode" value={form.pincode} onChange={handleFieldChange} placeholder="10001" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 text-gray-900" />
                {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleFieldChange} id="defaultAddress" className="w-4 h-4 text-gray-900 rounded" />
                <label htmlFor="defaultAddress" className="text-xs text-gray-900">Set as default address</label>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="bg-gray-50 p-5 sm:p-6 rounded-2xl border border-gray-200">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Payment Details</h2>
            <div className="mb-4 space-y-2">
              <label className="flex items-center gap-2">
                <input type="radio" name="paymentMethod" value="card" checked={form.paymentMethod === 'card'} onChange={handlePaymentMethodChange} className="w-4 h-4 text-gray-900" />
                <span className="text-sm text-gray-900">Credit / Debit Card</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="paymentMethod" value="upi" checked={form.paymentMethod === 'upi'} onChange={handlePaymentMethodChange} className="w-4 h-4 text-gray-900" />
                <span className="text-sm text-gray-900">UPI (QR / Google Pay)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="paymentMethod" value="cod" checked={form.paymentMethod === 'cod'} onChange={handlePaymentMethodChange} className="w-4 h-4 text-gray-900" />
                <span className="text-sm text-gray-900">Cash on Delivery</span>
              </label>
            </div>

            {/* UPI Section (QR + Official Google Pay) */}
            {form.paymentMethod === 'upi' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-900">Choose how to pay:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* QR Code Option */}
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedUpiMethod === 'qr' ? 'border-gray-900 bg-gray-100' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => setSelectedUpiMethod('qr')}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <input type="radio" checked={selectedUpiMethod === 'qr'} onChange={() => setSelectedUpiMethod('qr')} className="w-4 h-4 text-gray-900" />
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

                    {/* Official Google Pay Button */}
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedUpiMethod === 'app' ? 'border-gray-900 bg-gray-100' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => setSelectedUpiMethod('app')}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <input type="radio" checked={selectedUpiMethod === 'app'} onChange={() => setSelectedUpiMethod('app')} className="w-4 h-4 text-gray-900" />
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
              </div>
            )}

            {/* Card Payment Fields */}
            {form.paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-900 mb-1">Card Number *</label>
                  <input name="card" value={form.card} onChange={handleFieldChange} placeholder="1234 5678 9012 3456" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 text-gray-900" />
                  {errors.card && <p className="text-red-500 text-xs mt-1">{errors.card}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1">Expiry (MM/YY) *</label>
                    <input name="expiry" value={form.expiry} onChange={handleFieldChange} placeholder="MM/YY" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 text-gray-900" />
                    {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1">CVC *</label>
                    <input name="cvc" value={form.cvc} onChange={handleFieldChange} placeholder="123" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 text-gray-900" />
                    {errors.cvc && <p className="text-red-500 text-xs mt-1">{errors.cvc}</p>}
                  </div>
                </div>
              </div>
            )}

            {form.paymentMethod === 'cod' && (
              <div className="text-sm text-gray-600">
                Pay when you receive your order. No online payment required.
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isPaymentProcessing}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 hover:bg-black hover:scale-[1.02] active:scale-98 hover:shadow-lg disabled:opacity-50"
          >
            {isPaymentProcessing ? "Processing..." : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
}