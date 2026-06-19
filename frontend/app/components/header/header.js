'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import UserHeader from './UserHeader';
import AdminHeader from './AdminHeader';

export default function Header() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = () => {
      const admin = localStorage.getItem('adminLoggedIn');
      setIsAdmin(admin === 'true');
      setLoading(false);
    };
    checkAdmin();
    window.addEventListener('storage', checkAdmin);
    window.addEventListener('admin-updated', checkAdmin);
    return () => {
      window.removeEventListener('storage', checkAdmin);
      window.removeEventListener('admin-updated', checkAdmin);
    };
  }, []);

  if (loading) return null;

  return (
    <AnimatePresence mode="wait">
      {isAdmin ? (
        <motion.div
          key="admin-header"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
        
        </motion.div>
      ) : (
        <motion.div
          key="user-header"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <UserHeader />
        </motion.div>
      )}
    </AnimatePresence>
  );
}