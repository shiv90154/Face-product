'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Heart,
  Settings,
  LogOut,
  Edit2,
  ShoppingBag,
  Star,
  Truck,
  CreditCard,
  ChevronRight,
  Save,
  X,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    joinDate: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    reviews: 0,
    cards: 0,
  });

  // ─── Load user data from localStorage ────────────────────
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser({
          name: parsed.name || 'User',
          email: parsed.email || 'user@example.com',
          phone: parsed.phone || 'N/A',
          address: parsed.address || 'N/A',
          joinDate: parsed.joinDate || new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        });
        setEditForm({
          name: parsed.name || 'User',
          phone: parsed.phone || 'N/A',
          address: parsed.address || 'N/A',
        });
      } catch {
        // fallback
        setUser({
          name: 'User',
          email: 'user@example.com',
          phone: 'N/A',
          address: 'N/A',
          joinDate: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        });
      }
    }

    // ─── Stats from localStorage ────────────────────────────
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const wishlist = JSON.parse(localStorage.getItem('wishlist_products') || '{}');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    setStats({
      orders: orders.length,
      wishlist: Object.keys(wishlist).length,
      reviews: 0, // you can implement reviews later
      cards: 0,   // saved cards later
    });

    setLoading(false);
  }, [router]);

  // ─── Save edited user data ────────────────────────────────
  const handleSave = () => {
    const updatedUser = {
      ...user,
      name: editForm.name,
      phone: editForm.phone,
      address: editForm.address,
    };
    setUser(updatedUser);
    // Update localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const newData = { ...parsed, ...editForm };
        localStorage.setItem('user', JSON.stringify(newData));
      } catch {
        localStorage.setItem('user', JSON.stringify(editForm));
      }
    } else {
      localStorage.setItem('user', JSON.stringify(editForm));
    }
    setIsEditing(false);
  };

  // ─── Logout ────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2874f0]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <User size={28} className="text-gray-700" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">My Profile</h1>
              <p className="text-sm text-gray-500">Manage your account</p>
            </div>
          </div>
          <Link
            href="/settings"
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition"
          >
            <Settings size={18} /> Settings <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Left – User Card ──────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition">
              <div className="relative w-24 h-24 mx-auto bg-gray-200 rounded-full overflow-hidden border-4 border-white shadow">
                <div className="w-full h-full flex items-center justify-center bg-[#2874f0] text-3xl font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-500 text-sm">Member since {user.joinDate}</p>
              <div className="mt-4 flex justify-center gap-4 text-sm">
                <div className="text-center">
                  <p className="font-bold text-gray-800">{stats.orders}</p>
                  <p className="text-gray-500 text-xs">Orders</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-800">{stats.wishlist}</p>
                  <p className="text-gray-500 text-xs">Wishlist</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-800">{stats.reviews}</p>
                  <p className="text-gray-500 text-xs">Reviews</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 py-2 rounded-lg font-medium transition"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>

            {/* Quick links */}
            <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <Link
                href="/orders"
                className="flex items-center gap-3 py-2 px-3 hover:bg-gray-50 rounded-lg transition"
              >
                <Package size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">My Orders</span>
                <ChevronRight size={16} className="ml-auto text-gray-400" />
              </Link>
              <Link
                href="/liked"
                className="flex items-center gap-3 py-2 px-3 hover:bg-gray-50 rounded-lg transition"
              >
                <Heart size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Wishlist</span>
                <ChevronRight size={16} className="ml-auto text-gray-400" />
              </Link>
              <Link
                href="/addresses"
                className="flex items-center gap-3 py-2 px-3 hover:bg-gray-50 rounded-lg transition"
              >
                <MapPin size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Saved Addresses</span>
                <ChevronRight size={16} className="ml-auto text-gray-400" />
              </Link>
            </div>
          </div>

          {/* ─── Right – Details ───────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1 text-sm text-[#2874f0] hover:text-[#1a5fc7] transition"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition"
                    >
                      <X size={16} /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 transition"
                    >
                      <Save size={16} /> Save
                    </button>
                  </div>
                )}
              </div>

              {!isEditing ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-800">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium text-gray-800 flex items-center gap-1">
                      <Mail size={14} className="text-gray-400" /> {user.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium text-gray-800 flex items-center gap-1">
                      <Phone size={14} className="text-gray-400" /> {user.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="font-medium text-gray-800 flex items-center gap-1">
                      <MapPin size={14} className="text-gray-400" /> {user.address}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2874f0] focus:border-[#2874f0] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Phone</label>
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2874f0] focus:border-[#2874f0] outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-500">Address</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2874f0] focus:border-[#2874f0] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                  <div className="bg-blue-50 p-2 rounded-full">
                    <Truck size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">Order #1234 delivered</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                  <span className="text-green-600 text-xs font-bold">Delivered</span>
                </div>
                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                  <div className="bg-red-50 p-2 rounded-full">
                    <Heart size={16} className="text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">Added to wishlist</p>
                    <p className="text-xs text-gray-500">Yesterday</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                  <div className="bg-yellow-50 p-2 rounded-full">
                    <Star size={16} className="text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">Reviewed a product</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}