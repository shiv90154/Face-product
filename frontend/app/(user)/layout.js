// app/(user)/layout.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserHeader from '@/components/user/UserHeader';
import UserSidebar from '@/components/user/UserSidebar';

export default function UserLayout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch { setUser({ name: 'User', email: '' }); }
    } else {
      setUser({ name: 'User', email: '' });
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2874f0]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ─── Header ───────────────────────────────────────────── */}
      <UserHeader
        isUserPage={true}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        className="z-50"
      />

      {/* ─── Main row ────────────────────────────────────────── */}
      <div className="flex flex-1 pt-16 md:pt-1 relative">
        {/* ─── Desktop Sidebar (hidden on mobile) ─────────────── */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
            <UserSidebar
              user={user}
              onClose={() => setSidebarOpen(false)}
              onLogout={handleLogout}
            />
          </div>
        </div>

        {/* ─── Mobile Sidebar (overlay) ───────────────────────── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div
          className={`
            fixed top-16 md:top-20 left-0
            h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]
            w-72
            z-40 transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:hidden
          `}
        >
          <UserSidebar
            user={user}
            onClose={() => setSidebarOpen(false)}
            onLogout={handleLogout}
          />
        </div>

        {/* ─── Main Content ───────────────────────────────────── */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)]">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}