// components/WishlistButton.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { getLikedProductIds } from '@/lib/likes';

export default function WishlistButton() {
  // Start with null so we know the client hasn't loaded the real value yet
  const [count, setCount] = useState(null);

  useEffect(() => {
    // Now we're on the client – safe to read localStorage
    setCount(getLikedProductIds().length);

    const handleUpdate = () => setCount(getLikedProductIds().length);
    window.addEventListener('likes-updated', handleUpdate);
    return () => window.removeEventListener('likes-updated', handleUpdate);
  }, []);

  // Server & initial client render: no badge (count = null)
  // After hydration: badge appears only if count > 0
  return (
    <Link
      href="/liked"
      className="relative flex items-center gap-1 px-2 py-1 text-gray-700 hover:text-red-500 transition-colors"
    >
      <Heart size={20} />
      {count !== null && count > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full">
          {count > 9 ? '9+' : count}
        </span>
      )}
      <span className="hidden sm:inline text-sm">Wishlist</span>
    </Link>
  );
}