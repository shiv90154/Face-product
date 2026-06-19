'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userCount, setUserCount] = useState(0);

  // Authentication
  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsAdmin(true);
      setLoading(false);
      return;
    }
    const admin = localStorage.getItem('adminLoggedIn');
    if (admin === 'true') {
      setIsAdmin(true);
    } else {
      router.push('/admin/login');
    }
    setLoading(false);
  }, [pathname, router]);

  // Fetch user count (dummy)
  useEffect(() => {
    setUserCount(0); // replace with real API
  }, []);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    window.dispatchEvent(new Event('admin-updated'));
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#1a237e]" />
      </div>
    );
  }

  // On login page, only children
  if (pathname === '/admin/login') return <>{children}</>;

  if (!isAdmin) {
    router.push('/admin/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminHeader
        isScrolled={isScrolled}
        userCount={userCount}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
      />
      <div className="flex flex-1 relative">
        <AdminSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          userCount={userCount}
          onLogout={handleLogout}
        />
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}