'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, DollarSign, Package, Users, TrendingUp, Clock, Calendar, Heart, Shield } from 'lucide-react';
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

  useEffect(() => {
    const admin = localStorage.getItem('adminLoggedIn');
    if (admin !== 'true') {
      window.location.href = '/admin/login';
      return;
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#1a237e]" />
      </div>
    );
  }

  const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;

  return (
    <div>
      {/* Page title */}
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="text-[#1a237e] w-6 h-6" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <span className="text-sm text-gray-400 ml-2">Overview</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          {
            label: 'Total Orders',
            value: stats.totalOrders,
            icon: ShoppingCart,
            color: 'from-blue-500 to-blue-600',
            bg: 'bg-blue-50',
            text: 'text-blue-600',
          },
          {
            label: 'Total Revenue',
            value: formatCurrency(stats.totalRevenue),
            icon: DollarSign,
            color: 'from-green-500 to-green-600',
            bg: 'bg-green-50',
            text: 'text-green-600',
          },
          {
            label: 'Items Sold',
            value: stats.totalItems,
            icon: Package,
            color: 'from-purple-500 to-purple-600',
            bg: 'bg-purple-50',
            text: 'text-purple-600',
          },
          {
            label: 'Total Users',
            value: userCount,
            icon: Users,
            color: 'from-orange-500 to-orange-600',
            bg: 'bg-orange-50',
            text: 'text-orange-600',
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bg} group-hover:scale-110 transition-transform duration-200`}>
                <stat.icon className={`w-6 h-6 ${stat.text}`} />
              </div>
            </div>
            <div className="mt-4 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000`}
                style={{ width: '70%' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          </div>
          <span className="text-xs text-gray-400">Last 10 orders</span>
        </div>
        <div className="overflow-x-auto">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-semibold">Order ID</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.slice(0, 10).map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-900">
                      #{order.id?.slice(-8)}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {new Date(order.orderDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3 text-gray-900">
                      {order.shipping?.fullName || 'N/A'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      ₹{order.total?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
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

      {/* ─── Dashboard Mini Footer ────────────────────────── */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-400">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} Your Store</span>
            <span className="w-px h-3 bg-gray-300" />
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#1a237e]" />
              Admin v2.0
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <span className="w-px h-3 bg-gray-300" />
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-500" /> by Team
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}