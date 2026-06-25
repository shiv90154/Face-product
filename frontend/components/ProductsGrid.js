// components/ProductsGrid.js
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getProducts } from '@/lib/api';
import { addToCart } from '@/lib/cart';
import { Loader2, ChevronLeft } from 'lucide-react';
import LikeButton from '@/components/LikeButton';

const PLACEHOLDER_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-size='20' font-family='Arial' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";

export default function ProductsGrid({ 
  title = "All Products", 
  showHeader = true,
  showBackButton = false 
}) {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingProductId, setAddingProductId] = useState(null);
  const lastClickTime = useRef({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    const now = Date.now();
    if (lastClickTime.current[product._id] && now - lastClickTime.current[product._id] < 500) {
      return;
    }
    lastClickTime.current[product._id] = now;
    setAddingProductId(product._id);
    addToCart(product);
    alert(`${product.name} added to cart!`);
    setTimeout(() => setAddingProductId(null), 300);
  };

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#2874f0]" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-red-500">Error: {error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-[#2874f0] text-white rounded-lg">
          Retry
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">No products available yet.</p>
        <Link href="/" className="mt-4 text-[#2874f0] underline">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* ─── Hero banner (only if showHeader) ──────────────── */}
      {showHeader && (
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-10 sm:py-14 md:py-20 text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold px-4">{title}</h1>
          <p className="text-gray-300 mt-2 text-sm md:text-base px-4">Discover our complete collection</p>
        </section>
      )}

      <section className="py-6 sm:py-10 md:py-16 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* ─── Title bar (only when showHeader is false) ────── */}
        {!showHeader && (
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            {showBackButton && (
              <button
                onClick={goBack}
                className="p-2 rounded-full hover:bg-gray-100 transition-all hover:scale-105 text-gray-600 hover:text-gray-900"
                aria-label="Go back"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">{title}</h2>
          </div>
        )}

        {/* ─── Product grid ──────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {products.map((product, index) => {
            const imageUrl = product.images?.[0] || PLACEHOLDER_SVG;
            const isLocalhost = imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1');
            const shouldUnoptimize = isLocalhost || imageUrl === PLACEHOLDER_SVG;

            const hasDiscount = product.discountPrice && product.discountPrice < product.price;
            const finalPrice = hasDiscount ? product.discountPrice : product.price;

            return (
              <div
                key={product._id}
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-gray-300"
              >
                {/* ─── Image ─────────────────────────────────── */}
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <Link href={`/products/${product._id}`} className="relative block w-full h-full">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      unoptimized={shouldUnoptimize}
                      loading={index === 0 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
                      onError={(e) => { e.currentTarget.src = PLACEHOLDER_SVG; }}
                    />
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                        {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                      </span>
                    )}
                  </Link>
                  <div className="absolute top-2 right-2 z-10">
                    <LikeButton productId={product._id || product.id} product={product} />
                  </div>
                </div>

                {/* ─── Info ──────────────────────────────────── */}
                <div className="p-2 sm:p-3 md:p-4">
                  <Link href={`/products/${product._id}`}>
                    <h3 className="font-bold text-gray-900 hover:text-black transition text-xs sm:text-sm md:text-base line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-[10px] sm:text-xs text-gray-500 capitalize mt-0.5">
                    {product.category || 'Uncategorized'}
                  </p>
                  <div className="flex items-center justify-between mt-1 sm:mt-2">
                    <span className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
                      ₹{finalPrice}
                    </span>
                    {hasDiscount && (
                      <span className="text-[10px] sm:text-xs text-green-600 font-semibold bg-green-50 px-1 py-0.5 sm:px-1.5 rounded">
                        {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% off
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={addingProductId === product._id}
                    className="w-full mt-2 sm:mt-3 md:mt-4 bg-[#2874f0] text-white py-1.5 sm:py-2 rounded-lg font-semibold text-[10px] sm:text-xs md:text-sm transition-all duration-300 hover:bg-[#1a5fc7] hover:scale-105 active:scale-95 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingProductId === product._id ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
