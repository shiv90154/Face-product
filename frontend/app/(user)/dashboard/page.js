// app/(user)/dashboard/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Heart,
  ShoppingBag,
  Star,
  TrendingUp,
  Clock,
  ArrowRight,
  Truck,
  CheckCircle,
  Calendar,
  Shield,
  User,
  LogOut,
  Settings,
  CreditCard,
  Zap,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    cart: 0,
    reviews: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch { setUser({ name: 'User', email: '' }); }
    } else {
      setUser({ name: 'Guest', email: '' });
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

    const wishlist = JSON.parse(localStorage.getItem('wishlist_products') || '{}');
    const wishlistCount = Object.keys(wishlist).length;

    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderCount = orders.length;

    setStats({
      orders: orderCount,
      wishlist: wishlistCount,
      cart: cartCount,
      reviews: 0,
    });

    const sorted = [...orders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    setRecentOrders(sorted.slice(0, 3));

    setLoading(false);
  }, []);

  const statusColors = {
    Delivered: 'bg-green-100 text-green-700',
    'In Transit': 'bg-yellow-100 text-yellow-700',
    Processing: 'bg-blue-100 text-blue-700',
    Confirmed: 'bg-indigo-100 text-indigo-700',
    Cancelled: 'bg-red-100 text-red-700',
    Shipped: 'bg-purple-100 text-purple-700',
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2874f0]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Welcome Banner ───────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#2874f0] to-[#1a5fc7] rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold border-2 border-white/30">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Welcome back, {user?.name || 'Guest'}!</h2>
              <p className="text-white/80 text-sm">Here’s what’s happening with your account.</p>
            </div>
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105"
          >
            <User size={16} /> View Profile
          </Link>
        </div>
      </div>

      {/* ─── Quick Actions (ENHANCED) ────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-bold text-gray-800">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <QuickAction
            href="/shop"
            icon={<ShoppingBag size={24} />}
            label="Shop Now"
            gradient="from-blue-500 to-blue-600"
            hover="hover:from-blue-600 hover:to-blue-700"
          />
          
          <QuickAction
            href="/orders"
            icon={<Package size={24} />}
            label="My Orders"
            gradient="from-purple-500 to-purple-600"
            hover="hover:from-purple-600 hover:to-purple-700"
          />
          <QuickAction
            href="/liked"
            icon={<Heart size={24} />}
            label="Wishlist"
            gradient="from-red-500 to-red-600"
            hover="hover:from-red-600 hover:to-red-700"
          />
          <QuickAction
            href="/services"
            icon={<Settings size={24} />}
            label="services"
            gradient="from-gray-600 to-gray-700"
            hover="hover:from-gray-700 hover:to-gray-800"
          />
        </div>
      </div>

      {/* ─── Stats Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Package className="w-6 h-6 text-blue-600" />}
          label="Orders"
          value={stats.orders}
          bg="bg-blue-50"
          border="border-blue-100"
          onClick={() => router.push('/orders')}
        />
        <StatCard
          icon={<Heart className="w-6 h-6 text-red-500" />}
          label="Wishlist"
          value={stats.wishlist}
          bg="bg-red-50"
          border="border-red-100"
          onClick={() => router.push('/liked')}
        />
        <StatCard
          icon={<ShoppingBag className="w-6 h-6 text-green-600" />}
          label="Cart Items"
          value={stats.cart}
          bg="bg-green-50"
          border="border-green-100"
          onClick={() => router.push('/cart')}
        />
        <StatCard
          icon={<Star className="w-6 h-6 text-yellow-500" />}
          label="Reviews"
          value={stats.reviews}
          bg="bg-yellow-50"
          border="border-yellow-100"
        />
      </div>

      {/* ─── Recent Orders ───────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
          </div>
          <Link href="/orders" className="text-sm text-[#2874f0] hover:underline font-medium">
            View All
          </Link>
        </div>
        <div className="p-4 sm:p-6">
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No orders yet.</p>
              <Link href="/products" className="text-[#2874f0] text-sm hover:underline inline-block mt-2">
                Start shopping →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => {
                const status = order.status || 'Confirmed';
                const color = statusColors[status] || statusColors.Confirmed;
                return (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                          #{order.id.slice(-8)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(order.orderDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800">
                          ₹{order.total?.toFixed(2)}
                        </span>
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${color}`}>
                          {status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/orders`)}
                      className="mt-2 sm:mt-0 text-sm text-[#2874f0] hover:underline font-medium inline-flex items-center gap-1"
                    >
                      View <ArrowRight size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── Dashboard Mini Footer ──────────────────────────── */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-400">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} Your Store</span>
            <span className="w-px h-3 bg-gray-300" />
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#2874f0]" />
              User v2.0
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

// ─── Enhanced Quick Action Component ──────────────────────
function QuickAction({ href, icon, label, gradient, hover }) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-xl p-4 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-br ${gradient} ${hover}`}
    >
      <div className="flex flex-col items-center justify-center gap-2 relative z-10">
        <div className="text-white/90 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <span className="text-sm font-medium text-white/90 group-hover:text-white transition">
          {label}
        </span>
      </div>
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors" />
    </Link>
  );
}

// ─── Stat Card Component ──────────────────────────────────
function StatCard({ icon, label, value, bg, border, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`${bg} ${border} rounded-xl border p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-500">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className="p-2.5 bg-white rounded-full shadow-sm">{icon}</div>
      </div>
    </div>
  );
}