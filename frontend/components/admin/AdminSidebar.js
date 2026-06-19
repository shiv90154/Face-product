'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, Users } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Add Product', href: '/admin/products/add', icon: PlusCircle },
  { name: 'Orders', href: '/admin/orders', icon: ClipboardList },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
];
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ClipboardList,
  CreditCard,
} from 'lucide-react'; // <-- actually icons are defined above, import order adjusted

export default function AdminSidebar({
  sidebarOpen,
  setSidebarOpen,
  userCount,
  onLogout,
}) {
  const pathname = usePathname();

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => (document.body.style.overflow = 'unset');
  }, [sidebarOpen]);

  const handleLogoutClick = () => {
    setSidebarOpen(false);
    if (onLogout) onLogout();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 shadow-sm overflow-y-auto z-40">
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#1a237e] text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:scale-[1.02]'
                }`}
              >
                <Icon
                  size={20}
                  className={`transition-transform duration-200 ${
                    isActive
                      ? 'text-white'
                      : 'text-gray-500 group-hover:scale-110'
                  }`}
                />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-6 bg-white rounded-full"
                    transition={{ type: 'spring', duration: 0.3 }}
                  />
                )}
              </Link>
            );
          })}
          <hr className="my-3 border-gray-200" />
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition group"
          >
            <LogOut
              size={20}
              className="text-red-500 group-hover:scale-110 transition-transform"
            />
            Logout
          </button>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 text-xs text-gray-400 text-center">
          © {new Date().getFullYear()} Your Store
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between p-4 border-b">
                <span className="text-lg font-bold text-gray-900">Admin Menu</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                        isActive
                          ? 'bg-[#1a237e]/10 text-[#1a237e]'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon size={18} />
                      {item.name}
                    </Link>
                  );
                })}
                <hr className="my-2 border-gray-200" />
                <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700">
                  <Users size={18} className="text-[#1a237e]" />
                  <span>
                    Total Users: <span className="font-bold">{userCount}</span>
                  </span>
                </div>
                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </nav>
              <div className="p-4 border-t text-xs text-gray-400 text-center">
                Logged in as Admin
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}