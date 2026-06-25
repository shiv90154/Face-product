// components/LikeButton.js
'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { isProductLiked, toggleLikeProduct } from '@/lib/likes';

export default function LikeButton({ productId, product = null }) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(isProductLiked(productId));
  }, [productId]);

  const handleToggle = () => {
    const newLiked = !liked;
    setLiked(newLiked);

    // ─── 1. Update wishlist_products FIRST ────────────────
    const stored = JSON.parse(localStorage.getItem('wishlist_products') || '{}');

    if (newLiked && product) {
      // Add full product
      stored[productId] = product;
    } else {
      // Remove product
      delete stored[productId];
    }
    localStorage.setItem('wishlist_products', JSON.stringify(stored));

    // ─── 2. Then toggle the like ID (updates user_likes & dispatches event) ──
    toggleLikeProduct(productId);

    console.log(`Product ${productId} is now ${newLiked ? 'liked' : 'unliked'}`);
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-1.5 rounded-full transition-all duration-200 ${
        liked
          ? 'text-red-500 bg-red-50 hover:bg-red-100'
          : 'text-gray-400 bg-white/80 hover:bg-gray-100 hover:text-red-400'
      }`}
      aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        size={18}
        fill={liked ? 'currentColor' : 'none'}
        strokeWidth={2}
      />
    </button>
  );
}