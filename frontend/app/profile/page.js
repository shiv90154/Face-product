'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, Mail, Phone, MapPin, Package, Heart, Settings, LogOut, 
  Edit2, ShoppingBag, Star, Truck, CreditCard, ChevronRight,
  Clock, CheckCircle, XCircle, Home, Briefcase, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock order data
const orders = [
  { id: 'ORD-001', date: '2024-01-15', total: 89.97, status: 'Delivered', items: 3, image: 'https://picsum.photos/id/20/100/100' },
  { id: 'ORD-002', date: '2024-02-20', total: 124.99, status: 'Shipped', items: 2, image: 'https://picsum.photos/id/26/100/100' },
  { id: 'ORD-003', date: '2024-03-10', total: 45.50, status: 'Processing', items: 1, image: 'https://picsum.photos/id/29/100/100' },
];

const wishlist = [
  { id: 1, name: 'Hydrating Cream Cleanser', price: 24.99, image: 'https://picsum.photos/id/20/200/200', rating: 4.5 },
  { id: 3, name: 'Oil-Free Gel Moisturizer', price: 32.99, image: 'https://picsum.photos/id/29/200/200', rating: 4.6 },
];

const addresses = [
  { id: 1, name: 'Home', street: '123 Main St', city: 'New York', state: 'NY', zip: '10001', isDefault: true },
  { id: 2, name: 'Work', street: '456 Office Blvd', city: 'Brooklyn', state: 'NY', zip: '11201', isDefault: false },
];

export default function ProfilePage() {
  const { user, logout } = useAuth(); // assuming you have an auth context
  const [activeTab, setActiveTab] = useState('orders');
  const [isEditing, setIsEditing] = useState(false);

  // Mock user data (replace with actual from auth)
  const profileUser = user || {
    fullName: 'Jessica Thompson',
    email: 'jessica@example.com',
    phone: '+1 (555) 123-4567',
    avatar: 'https://picsum.photos/id/64/200/200',
    memberSince: 'January 2024',
  };

  const handleLogout = async () => {
    await logout();
    // redirect handled by auth context
  };

  const tabs = [
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered': return 'text-green-600 bg-green-50';
      case 'Shipped': return 'text-blue-600 bg-blue-50';
      case 'Processing': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Delivered': return <CheckCircle size={14} />;
      case 'Shipped': return <Truck size={14} />;
      case 'Processing': return <Clock size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-gray-100 group-hover:ring-gray-200 transition-all duration-300">
                <Image
                  src={profileUser.avatar}
                  alt={profileUser.fullName}
                  width={96}
                  height={96}
                  className="object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 bg-gray-900 text-white p-1.5 rounded-full shadow-lg hover:bg-black transition-all hover:scale-110">
                <Edit2 size={14} />
              </button>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{profileUser.fullName}</h1>
                <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full self-center sm:self-auto">
                  <Star size={12} /> Gold Member
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-2 text-gray-600 text-sm">
                <div className="flex items-center gap-1 justify-center sm:justify-start">
                  <Mail size={14} /> {profileUser.email}
                </div>
                <div className="flex items-center gap-1 justify-center sm:justify-start">
                  <Phone size={14} /> {profileUser.phone}
                </div>
                <div className="flex items-center gap-1 justify-center sm:justify-start">
                  <Clock size={14} /> Member since {profileUser.memberSince}
                </div>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-all hover:scale-105"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all duration-300 ${
                  isActive 
                    ? 'text-gray-900 border-b-2 border-gray-900 bg-gray-50' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.map((order, idx) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image src={order.image} alt={order.id} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-gray-900">Order #{order.id}</h3>
                            <p className="text-sm text-gray-500">{order.date} • {order.items} items</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)} {order.status}
                            </span>
                            <span className="font-bold text-gray-900">${order.total}</span>
                          </div>
                        </div>
                        <button className="mt-3 text-sm font-semibold text-gray-900 hover:text-black flex items-center gap-1 transition-all hover:translate-x-1">
                          View Details <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {orders.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-xl border">
                    <Package size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No orders yet</p>
                    <Link href="/products" className="inline-block mt-2 text-gray-900 font-semibold hover:underline">Start Shopping →</Link>
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlist.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
                  >
                    <div className="relative h-48 bg-gray-100">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-gray-900 text-sm">{item.name}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <span className="font-bold text-gray-900">${item.price}</span>
                        <div className="flex text-yellow-400 text-xs">
                          {'★'.repeat(Math.floor(item.rating))}{'☆'.repeat(5 - Math.floor(item.rating))}
                        </div>
                      </div>
                      <button className="w-full mt-3 bg-gray-900 text-white py-1.5 rounded-lg text-sm font-semibold hover:bg-black transition-all hover:scale-105">
                        Add to Cart
                      </button>
                    </div>
                  </motion.div>
                ))}
                {wishlist.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-white rounded-xl border">
                    <Heart size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">Your wishlist is empty</p>
                    <Link href="/products" className="inline-block mt-2 text-gray-900 font-semibold hover:underline">Browse Products →</Link>
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <motion.div
                    key={addr.id}
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {addr.name === 'Home' ? <Home size={18} /> : <Briefcase size={18} />}
                        <h3 className="font-bold text-gray-900">{addr.name}</h3>
                        {addr.isDefault && (
                          <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded-full">Default</span>
                        )}
                      </div>
                      <button className="text-gray-400 hover:text-gray-900 transition">
                        <Edit2 size={16} />
                      </button>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>{addr.street}</p>
                      <p>{addr.city}, {addr.state} {addr.zip}</p>
                    </div>
                  </motion.div>
                ))}
                <button className="flex items-center justify-center gap-2 bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-all hover:scale-[1.01]">
                  <Plus size={18} /> Add New Address
                </button>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive order updates and promotions</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
                      <span className="sr-only">Enable notifications</span>
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <div>
                      <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                    <button className="text-gray-900 text-sm font-semibold hover:underline">Enable</button>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <div>
                      <p className="font-medium text-gray-900">Change Password</p>
                      <p className="text-sm text-gray-500">Update your password regularly</p>
                    </div>
                    <button className="text-gray-900 text-sm font-semibold hover:underline">Update</button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}