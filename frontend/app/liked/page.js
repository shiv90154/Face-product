'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // <-- added
import Image from 'next/image';
import { getProducts } from '@/lib/api';
import { getLikedProductIds } from '@/lib/likes';
import { addToCart } from '@/lib/cart';
import { Loader2, Heart, ShoppingBag, RefreshCw, Star, Truck, ChevronLeft } from 'lucide-react'; // <-- added ChevronLeft
import LikeButton from '@/components/LikeButton';

// ─── Inline placeholder ──
const PLACEHOLDER_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-size='20' font-family='Arial' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function LikedPage() {
  const router = useRouter(); // <-- added
  const [likedProducts, setLikedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingId, setAddingId] = useState(null);

  // ─── Back handler ──────────────────────────────────────────
  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const loadLiked = async () => {
    try {
      setLoading(true);
      setError(null);

      const stored = JSON.parse(localStorage.getItem('wishlist_products') || '{}');
      const storedProducts = Object.values(stored);

      if (storedProducts.length > 0) {
        setLikedProducts(storedProducts);
        setLoading(false);
        return;
      }

      const all = await getProducts();
      const likedIds = getLikedProductIds();
      const filtered = all.filter(p => {
        const id = p._id || p.id;
        return likedIds.includes(id);
      });
      setLikedProducts(filtered);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiked();
    const handler = () => loadLiked();
    window.addEventListener('likes-updated', handler);
    window.addEventListener('storage', (e) => {
      if (e.key === 'wishlist_products' || e.key === 'user_likes') loadLiked();
    });
    return () => {
      window.removeEventListener('likes-updated', handler);
      window.removeEventListener('storage', loadLiked);
    };
  }, []);

  const handleAddToCart = (product) => {
    setAddingId(product._id);
    addToCart(product);
    setTimeout(() => setAddingId(null), 300);
  };

  // ─── Loading ─────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#2874f0]" size={40} />
      </div>
    );
  }

  // ─── Error ───────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={loadLiked} className="px-6 py-2 bg-[#2874f0] text-white rounded-lg">
          Try Again
        </button>
      </div>
    );
  }

  // ─── Empty ───────────────────────────────────
  if (likedProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center bg-gray-50">
        <Heart size={80} className="text-gray-300 mb-6" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          Your wishlist is empty
        </h1>
        <p className="text-gray-500 mb-8 max-w-md">
          Tap the heart icon on any product to save it here for later.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-[#2874f0] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#1a5fc7] transition shadow-md"
        >
          <ShoppingBag size={18} /> Start Shopping
        </Link>
      </div>
    );
  }

  // ─── Wishlist Grid ──────────────────────────
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header – with back button */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Back button */}
            <button
              onClick={goBack}
              className="p-2 rounded-full hover:bg-gray-100 transition-all hover:scale-105 text-gray-600 hover:text-gray-900"
              aria-label="Go back"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Wishlist</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {likedProducts.length} {likedProducts.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
          </div>
          <button
            onClick={loadLiked}
            className="inline-flex items-center gap-2 text-sm text-[#2874f0] hover:text-[#1a5fc7] transition font-medium"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {likedProducts.map((product) => {
            const imageUrl = product.images?.[0] || product.image || PLACEHOLDER_SVG;
            const isLocalhost = imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1');
            const shouldUnoptimize = isLocalhost || imageUrl === PLACEHOLDER_SVG;

            const hasDiscount = product.discountPrice && product.discountPrice < product.price;
            const finalPrice = hasDiscount ? product.discountPrice : product.price;
            const discountPercent = hasDiscount
              ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
              : 0;

            // Static rating (you can replace with real data)
            const rating = 4.1;
            const reviews = 49219;

            return (
              <div
                key={product._id || product.id}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 hover:-translate-y-1 hover:border-gray-300 flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <Link href={`/products/${product._id}`} className="block w-full h-full">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      unoptimized={shouldUnoptimize}
                      onError={(e) => { e.currentTarget.src = PLACEHOLDER_SVG; }}
                    />
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </Link>
                  {/* Like Button – top right */}
                  <div className="absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-md">
                    <LikeButton productId={product._id || product.id} product={product} />
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-3 flex flex-col flex-1">
                  <Link href={`/products/${product._id}`} className="block">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2 leading-tight hover:text-[#2874f0] transition">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex items-center bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
                      {rating} <Star size={12} className="ml-0.5 fill-current" />
                    </div>
                    <span className="text-gray-500 text-xs">({reviews.toLocaleString()})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-gray-900">₹{finalPrice}</span>
                    {hasDiscount && (
                      <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                    )}
                  </div>

                  {/* Delivery info */}
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <Truck size={14} className="text-green-600" />
                    <span>Free delivery</span>
                  </div>

                  {/* Add to Cart Button – full width */}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={addingId === product._id}
                    className="w-full mt-3 bg-[#2874f0] hover:bg-[#1a5fc7] text-white py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    {addingId === product._id ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin" /> Adding...
                      </span>
                    ) : (
                      'Add to Cart'
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}