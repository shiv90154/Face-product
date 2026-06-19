'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Calendar, Eye, ChevronLeft, X, ShoppingBag } from 'lucide-react';

// Centralized status color map (matches brand colors)
const statusColors = {
  Confirmed: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  Shipped: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
  },
  Delivered: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-500',
  },
  Cancelled: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
      const parsed = JSON.parse(storedOrders);
      parsed.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      setOrders(parsed);
    }
    setLoading(false);
  }, []);

  const cancelOrder = (orderId) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: 'Cancelled' } : order
      );
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      setOrders(updatedOrders);
    }
  };

  const viewDetails = (order) => setSelectedOrder(order);
  const closeDetails = () => setSelectedOrder(null);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-all hover:scale-105 text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-500 mt-1">Track and manage your orders</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't placed any orders.</p>
            <Link
              href="/products"
              className="inline-block bg-gray-900 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-black transition-all hover:scale-105 active:scale-95"
            >
              Start Shopping
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {orders.map((order) => {
              const status = order.status || 'Confirmed';
              const color = statusColors[status] || statusColors.Confirmed;
              return (
                <motion.div
                  key={order.id}
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-wrap justify-between items-start gap-4">
                      <div className="space-y-2 flex-1 min-w-[200px]">
                        {/* Order ID & Date */}
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span className="font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                            #{order.id.slice(-8)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(order.orderDate)}
                          </span>
                        </div>

                        {/* Total & Status */}
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-lg font-bold text-gray-900">
                            ₹{order.total?.toFixed(2)}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${color.bg} ${color.text} border ${color.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${color.dot} ${status !== 'Cancelled' && status !== 'Delivered' ? 'animate-pulse' : ''}`} />
                            {status}
                          </span>
                          <span className="text-xs text-gray-400">{order.paymentMethod}</span>
                        </div>

                        {/* Items count */}
                        <p className="text-xs text-gray-400">
                          {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => viewDetails(order)}
                          className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition flex items-center gap-1.5 hover:scale-105 active:scale-95"
                        >
                          <Eye size={14} />
                          View Details
                        </button>
                        {status !== 'Cancelled' && status !== 'Delivered' && (
                          <button
                            onClick={() => cancelOrder(order.id)}
                            className="text-sm bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition hover:scale-105 active:scale-95"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Order Details Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={closeDetails}
            >
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                  <button
                    onClick={closeDetails}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                  {/* Order info */}
                  <div className="grid sm:grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</p>
                      <p className="font-mono text-sm mt-1">{selectedOrder.id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date</p>
                      <p className="text-sm mt-1">{new Date(selectedOrder.orderDate).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</p>
                      <p className="text-sm mt-1">{selectedOrder.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</p>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mt-1 ${
                        statusColors[selectedOrder.status]?.bg || 'bg-gray-100'
                      } ${
                        statusColors[selectedOrder.status]?.text || 'text-gray-700'
                      }`}>
                        {selectedOrder.status || 'Confirmed'}
                      </span>
                    </div>
                  </div>

                  {/* Shipping address */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Shipping Address</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-1 text-sm">
                      <p className="font-medium text-gray-900">{selectedOrder.shipping?.fullName}</p>
                      <p className="text-gray-600">{selectedOrder.shipping?.email}</p>
                      <p className="text-gray-600">{selectedOrder.shipping?.phone}</p>
                      <p className="text-gray-600">{selectedOrder.shipping?.address}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0">
                          <div>
                            <p className="font-medium text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between font-bold text-gray-900">
                      <span>Total</span>
                      <span>₹{selectedOrder.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}