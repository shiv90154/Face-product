'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  DollarSign,
  ShoppingCart,
  Users,
  LogOut,
  PlusCircle,
  CreditCard,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getUserCount } from '@/lib/api';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalItems: 0,
  });
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // ─── Check admin session ──────────────────────────────
  useEffect(() => {
    const admin = localStorage.getItem('adminLoggedIn');
    console.log('🔍 AdminDashboard: adminLoggedIn =', admin);

    if (admin !== 'true') {
      console.warn('⛔ Not authenticated – redirecting to login');
      window.location.href = '/admin/login';
      return;
    }

    console.log('✅ Authenticated – fetching data');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const storedOrders = localStorage.getItem('orders');
      let parsed = storedOrders ? JSON.parse(storedOrders) : [];
      setOrders(parsed);

      const totalOrders = parsed.length;
      const totalRevenue = parsed.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalItems = parsed.reduce((sum, order) => {
        const itemCount = order.items
          ? order.items.reduce((s, i) => s + (i.quantity || 0), 0)
          : 0;
        return sum + itemCount;
      }, 0);
      setStats({ totalOrders, totalRevenue, totalItems });

      try {
        const count = await getUserCount();
        setUserCount(count);
      } catch (err) {
        console.warn('Failed to fetch user count:', err);
        setUserCount(0);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    window.dispatchEvent(new Event('admin-updated'));
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#1a237e]"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/admin/products"
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition"
            >
              <Package size={18} />
              Products
            </Link>
            <Link
              href="/admin/products/add"
              className="flex items-center gap-2 bg-[#1a237e] hover:bg-[#0d1757] text-white px-4 py-2 rounded-lg transition"
            >
              <PlusCircle size={18} />
              Add Product
            </Link>
            <Link
              href="/admin/payments"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
            >
              <CreditCard size={18} />
              Payments
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <ShoppingCart size={32} className="text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign size={32} className="text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Items Sold</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              </div>
              <Package size={32} className="text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{userCount}</p>
              </div>
              <Users size={32} className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders yet.</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 10).map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-900">
                        #{order.id?.slice(-8)}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {order.shipping?.fullName || 'N/A'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        ₹{order.total?.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            order.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : order.status === 'Delivered'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {order.status || 'Confirmed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}