// components/user/UserSidebar.js
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  User,
  Package,
  Heart,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react';

export default function UserSidebar({ user, onClose, onLogout }) {
  const pathname = usePathname();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Package, label: 'Orders', href: '/orders' },
    { icon: Heart, label: 'Wishlist', href: '/liked' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  return (
    <aside className="h-full w-72 bg-white border-r border-gray-200 flex flex-col shadow-lg lg:shadow-none">
      {/* User Info */}
      <div className="p-6 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#2874f0] rounded-full flex items-center justify-center text-white font-bold text-lg">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 truncate">{user?.name || 'User'}</p>
            <p className="text-sm text-gray-500 truncate">{user?.email || ''}</p>
            <p className="text-xs text-gray-400">ID: {user?._id || user?.id || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Navigation – scrollable */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-[#2874f0]/10 text-[#2874f0] font-semibold'
                      : 'text-gray-700 hover:bg-[#2874f0]/10 hover:text-[#2874f0]'
                  }`}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  <span className="flex-1 font-medium">{item.label}</span>
                  <ChevronRight
                    size={16}
                    className={`transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout – fixed bottom */}
      <div className="p-4 border-t border-gray-200 shrink-0">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition font-medium"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}