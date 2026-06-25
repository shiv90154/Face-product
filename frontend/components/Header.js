'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import WishlistButton from '@/components/WishlistButton';
import {
  Menu,
  X,
  ShoppingCart,
  LogIn,
  UserPlus,
  Grid3x3,
  Home,
  Package,
  Phone,
  Tag,
  Droplet,
  Sparkles,
  Flower2,
  Sun,
  FlaskConical,
  ClipboardList,
  Shield,
  Heart,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STATIC_CATEGORIES = ['cleansers', 'serums', 'moisturizers', 'sunscreens', 'treatments'];

const userNavItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Services', href: '/services', icon: Grid3x3 },
  { name: 'Contact', href: '/contact', icon: Phone },
  { name: 'Orders', href: '/orders', icon: ClipboardList },
];

const categoryIconMap = {
  cleansers: Droplet,
  serums: Sparkles,
  moisturizers: Flower2,
  sunscreens: Sun,
  treatments: FlaskConical,
};

const defaultIcon = Tag;

export default function UserHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [servicesExpanded, setServicesExpanded] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [categories, setCategories] = useState(STATIC_CATEGORIES);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // ─── Auth checker ──────────────────────────────────────────
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
      try {
        const storedUser = localStorage.getItem('user');
        setUser(storedUser ? JSON.parse(storedUser) : { name: 'User', email: '' });
      } catch {
        setUser({ name: 'User', email: '' });
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    window.addEventListener('auth-updated', checkAuth);
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('auth-updated', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, [checkAuth]);

  // ─── Categories ─────────────────────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_BASE}/categories`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      } catch {
        // keep fallback
      }
    };
    fetchCategories();
  }, []);

  const categoryItems = categories.map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    slug: cat,
    icon: categoryIconMap[cat] || defaultIcon,
  }));

  // ─── Cart count ────────────────────────────────────────────
  const updateCartCount = useCallback(() => {
    if (typeof window !== 'undefined') {
      const cart = localStorage.getItem('cart');
      if (cart) {
        try {
          const items = JSON.parse(cart);
          const count = items.reduce((total, item) => total + (item.quantity || 1), 0);
          setCartCount(count);
        } catch {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    }
  }, []);

  useEffect(() => {
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cart-updated', updateCartCount);
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, [updateCartCount]);

  // ─── Scroll & resize ──────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobileScreen(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobileScreen) {
      document.body.classList.add('pb-16');
    } else {
      document.body.classList.remove('pb-16');
    }
    return () => document.body.classList.remove('pb-16');
  }, [isMobileScreen]);

  // ─── Sidebar overflow ──────────────────────────────────────
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setServicesExpanded(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  useEffect(() => {
    setSidebarOpen(false);
    setServicesExpanded(false);
  }, [pathname]);

  // ─── Logout ─────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    window.dispatchEvent(new Event('auth-updated'));
    window.location.href = '/';
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50'
            : 'bg-white shadow-md border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent hover:from-gray-800 hover:to-gray-500 transition-all duration-500 transform hover:scale-105"
            >
              Brand
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-0.5 lg:space-x-2">
              {userNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="relative px-3 lg:px-4 py-2 text-sm lg:text-base font-medium rounded-lg transition-all duration-300 hover:bg-gray-50 hover:text-black group"
                  >
                    <span className={isActive ? 'text-black font-semibold' : 'text-gray-700'}>
                      {item.name}
                    </span>
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gray-900 transition-all duration-300 group-hover:w-6" />
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gray-900" />
                    )}
                  </Link>
                );
              })}
              <Link
                href="/admin/login"
                className="relative px-3 lg:px-4 py-2 text-sm lg:text-base font-medium rounded-lg transition-all duration-300 hover:bg-gray-50 hover:text-black group"
              >
                <span className="flex items-center gap-1 text-gray-700">
                  <Shield size={16} />
                  Admin
                </span>
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              <Link
                href="/cart"
                className="relative p-2 rounded-full hover:bg-gray-100 transition-transform hover:scale-105"
              >
                <ShoppingCart size={18} className="text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full shadow-md ring-2 ring-white">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Wishlist */}
              <WishlistButton />

              {/* ─── Auth Buttons ─────────────────────────────── */}
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition"
                  >
                    <div className="w-7 h-7 bg-[#2874f0] rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <span className="hidden lg:inline">Dashboard</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition px-2 py-1 rounded-lg hover:bg-red-50"
                  >
                    <LogOut size={16} />
                    <span className="hidden lg:inline">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-semibold rounded-full transition-all duration-300 bg-transparent border border-gray-300 text-gray-700 hover:border-gray-900 hover:text-black hover:bg-gray-50 hover:scale-105 active:scale-95"
                  >
                    <LogIn size={14} /> Login
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-1.5 px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-semibold rounded-full transition-all duration-300 bg-transparent border border-gray-300 text-gray-700 hover:border-gray-900 hover:text-black hover:bg-gray-50 hover:scale-105 active:scale-95"
                  >
                    <UserPlus size={14} /> Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <div className="flex md:hidden items-center gap-2">
              <Link
                href="/cart"
                className="relative p-2 rounded-full hover:bg-gray-100 transition-transform hover:scale-105"
              >
                <ShoppingCart size={18} className="text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full shadow-md ring-2 ring-white">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-full hover:bg-gray-100 transition-transform hover:scale-105"
              >
                <Menu size={18} className="text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-80 sm:w-96 max-w-[85vw] bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-4 sm:p-5 border-b">
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Menu
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-transform hover:rotate-90"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1">
                {/* ... same nav items as before ... */}
                {userNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  if (item.name === 'Services') {
                    return (
                      <div key={item.name} className="space-y-1">
                        <button
                          onClick={() => setServicesExpanded(!servicesExpanded)}
                          className={`group w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all duration-300 ${
                            isActive ? 'bg-gray-100 text-black' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={16} className="text-gray-600 group-hover:text-black" />
                            <span className="text-black">Services</span>
                          </div>
                          <motion.div
                            animate={{ rotate: servicesExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </motion.div>
                        </button>
                        <AnimatePresence>
                          {servicesExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="ml-6 sm:ml-8 pl-2 sm:pl-3 border-l-2 border-gray-200 space-y-1 overflow-hidden"
                            >
                              {categoryItems.map((cat) => {
                                const CatIcon = cat.icon;
                                return (
                                  <Link
                                    key={cat.slug}
                                    href={`/services/${cat.slug}`}
                                    className="flex items-center gap-3 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-all hover:translate-x-1"
                                    onClick={() => {
                                      setSidebarOpen(false);
                                      setServicesExpanded(false);
                                    }}
                                  >
                                    <CatIcon size={14} />
                                    <span>{cat.name}</span>
                                  </Link>
                                );
                              })}
                              <Link
                                href="/services"
                                className="flex items-center gap-3 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-gray-900 rounded-lg hover:bg-gray-100 transition-all hover:translate-x-1"
                                onClick={() => {
                                  setSidebarOpen(false);
                                  setServicesExpanded(false);
                                }}
                              >
                                <Grid3x3 size={14} />
                                <span>All Categories →</span>
                              </Link>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium transition-all duration-300 ${
                        isActive ? 'bg-gray-100 text-black' : 'text-gray-700 hover:bg-gray-50 hover:translate-x-1'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon size={16} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
                <Link
                  href="/liked"
                  className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium text-gray-700 hover:bg-gray-50 hover:translate-x-1 transition-all"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Heart size={16} className="text-red-500" />
                  <span>Wishlist</span>
                </Link>
                <Link
                  href="/admin/login"
                  className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-medium text-gray-700 hover:bg-gray-50 transition"
                  onClick={() => setSidebarOpen(false)}
                >
                  <Shield size={16} />
                  <span>Admin Login</span>
                </Link>
              </nav>
              <div className="p-3 sm:p-4 border-t space-y-2">
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setSidebarOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 bg-red-50 text-red-600 hover:bg-red-100 active:scale-98"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 bg-transparent border border-gray-300 text-gray-700 hover:border-gray-900 hover:text-black hover:bg-gray-50 active:scale-98"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <LogIn size={16} /> Login
                    </Link>
                    <Link
                      href="/register"
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 bg-transparent border border-gray-300 text-gray-700 hover:border-gray-900 hover:text-black hover:bg-gray-50 active:scale-98"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <UserPlus size={16} /> Register
                    </Link>
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around px-2 py-1.5">
          <Link href="/" className="flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:scale-105 active:scale-95">
            <Home size={20} className="text-gray-700" />
            <span className="text-[10px] font-medium text-gray-600 mt-0.5">Home</span>
          </Link>
          <Link href="/products" className="flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:scale-105 active:scale-95">
            <Package size={20} className="text-gray-700" />
            <span className="text-[10px] font-medium text-gray-600 mt-0.5">Products</span>
          </Link>
          <Link href="/orders" className="flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:scale-105 active:scale-95">
            <ClipboardList size={20} className="text-gray-700" />
            <span className="text-[10px] font-medium text-gray-600 mt-0.5">Orders</span>
          </Link>
          <Link href="/cart" className="relative flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:scale-105 active:scale-95">
            <div className="relative">
              <ShoppingCart size={20} className="text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-red-500 rounded-full shadow-md">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium text-gray-600 mt-0.5">Cart</span>
          </Link>
          {isLoggedIn ? (
            <Link href="/dashboard" className="flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:scale-105 active:scale-95">
              <LayoutDashboard size={20} className="text-[#2874f0]" />
              <span className="text-[10px] font-medium text-gray-600 mt-0.5">Dashboard</span>
            </Link>
          ) : (
            <Link href="/login" className="flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-all duration-300 hover:bg-gray-100 hover:scale-105 active:scale-95">
              <LogIn size={20} className="text-gray-700" />
              <span className="text-[10px] font-medium text-gray-600 mt-0.5">Login</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}