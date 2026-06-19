'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Trash2, Heart, Truck, Shield, Star } from 'lucide-react';

// ─── Inline SVG placeholder (no external file needed) ──
const PLACEHOLDER_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-size='20' font-family='Arial' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [isClient, setIsClient] = useState(false);

  // ─── Load cart on client ──────────────────────────────
  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem('cart');
    if (stored) setCartItems(JSON.parse(stored));
  }, []);

  // ─── Persist cart changes ─────────────────────────────
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
      window.dispatchEvent(new Event('cart-updated'));
    }
  }, [cartItems, isClient]);

  // ─── Helpers ───────────────────────────────────────────
  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQty } : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const saveForLater = (id) => {
    alert('Item saved for later (demo)');
  };

  // ─── Totals ─────────────────────────────────────────────
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  const fees = 7;
  const discounts = cartItems.reduce(
    (sum, item) =>
      sum +
      (item.discountPrice ? (item.price - item.discountPrice) * item.quantity : 0),
    0
  );
  const total = subtotal + fees - discounts;

  // ─── SSR fallback ──────────────────────────────────────
  if (!isClient) {
    return <div className="min-h-screen bg-gray-50 py-10" />;
  }

  // ─── Empty cart ────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-4 py-20">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h1>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Looks like you haven't added anything yet.
          </p>
          <Link
            href="/products"
            className="inline-block bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-black transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">My Cart</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ─── LEFT – Product List ───────────────────── */}
          <div className="flex-1 space-y-4">
            {cartItems.map((item) => {
              const hasDiscount =
                item.discountPrice && item.discountPrice < item.price;
              const finalPrice = hasDiscount ? item.discountPrice : item.price;

              // ─── Image URL with fallback ──────────────
              const imageSrc =
                item.image && item.image.startsWith('http')
                  ? item.image
                  : PLACEHOLDER_SVG;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{
                    scale: 1.01,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                  }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:border-gray-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-gray-100 rounded-lg overflow-hidden mx-auto sm:mx-0">
                        <Image
                          src={imageSrc}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 112px, 128px"
                          loading="eager"
                          onError={(e) => {
                            e.currentTarget.src = PLACEHOLDER_SVG;
                          }}
                          unoptimized
                        />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex flex-wrap items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="flex items-center bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
                              4.1 <Star size={12} className="ml-0.5 fill-current" />
                            </span>
                            <span className="text-gray-500 text-xs">(49,219)</span>
                            <span className="ml-2 text-green-700 text-xs font-medium border border-green-200 px-1.5 rounded">
                              Assured
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xl font-bold text-gray-900">
                              ₹{finalPrice.toFixed(2)}
                            </span>
                            {hasDiscount && (
                              <>
                                <span className="text-sm text-gray-400 line-through">
                                  ₹{item.price.toFixed(2)}
                                </span>
                                <span className="text-sm text-green-600 font-semibold">
                                  {Math.round(
                                    ((item.price - item.discountPrice) / item.price) *
                                      100
                                  )}
                                  % off
                                </span>
                              </>
                            )}
                          </div>
                          {hasDiscount && (
                            <div className="mt-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full inline-block">
                              WOW! Buy at ₹{finalPrice.toFixed(2)}
                            </div>
                          )}
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-8 h-8 rounded-full border border-gray-300 bg-gray-50 hover:bg-gray-200 transition flex items-center justify-center text-gray-700 font-bold"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-semibold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-8 h-8 rounded-full border border-gray-300 bg-gray-50 hover:bg-gray-200 transition flex items-center justify-center text-gray-700 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Delivery & Actions */}
                      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center text-xs text-gray-600">
                          <Truck size={14} className="mr-1" />
                          <span className="font-medium text-green-700">EXPRESS</span>
                          <span className="mx-1">•</span>
                          <span>Delivery in 2 days, Sat</span>
                        </div>
                        <div className="flex items-center gap-2 ml-auto">
                          <button
                            onClick={() => saveForLater(item.id)}
                            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition"
                          >
                            <Heart size={14} /> Save for later
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition"
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ─── RIGHT – Price Summary ──────────────────── */}
          <div className="lg:w-80 xl:w-96 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 sticky top-24 shadow-sm"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4">Price Details</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>MRP (incl. of all taxes)</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Fees</span>
                  <span>₹{fees.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discounts</span>
                  <span>−₹{discounts.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 border-t pt-2 mt-2 text-base">
                  <span>Total Amount</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              {discounts > 0 && (
                <div className="mt-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                  🎉 You'll save ₹{discounts.toFixed(2)} on this order!
                </div>
              )}

              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 border-t pt-3">
                <Shield size={14} className="text-green-600" />
                <span>
                  Safe and secure payments. Easy returns. 100% Authentic products.
                </span>
              </div>

              <Link
                href="/checkout"
                className="block w-full mt-4 bg-[#1a237e] hover:bg-[#0d1757] text-white text-center font-bold py-3 rounded-lg transition"
              >
                Place Order
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}