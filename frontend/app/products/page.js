'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { addToCart } from '../../lib/cart';
import { getProducts}   from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingProductId, setAddingProductId] = useState(null);
  const lastClickTime = useRef({});

  // ─── Fetch products ──────────────────────────────────────
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

  // ─── Add to cart with debounce ──────────────────────────
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

  // ─── Loading state ──────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[#1a237e]" size={40} />
      </div>
    );
  }

  // ─── Error state ──────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-500">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[#1a237e] text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  // ─── Empty state ──────────────────────────────────────
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500">No products available yet.</p>
        <Link href="/" className="mt-4 text-[#1a237e] underline">
          Go back home
        </Link>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 md:py-16 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold">All Face Products</h1>
        <p className="text-gray-300 mt-2 text-sm md:text-base">Discover our complete collection</p>
      </section>

      {/* Products Grid */}
      <section className="py-8 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {products.map((product) => {
            const imageUrl = product.images?.[0] || '/placeholder.png';
            const hasDiscount = product.discountPrice && product.discountPrice < product.price;
            const finalPrice = hasDiscount ? product.discountPrice : product.price;
            const rating = product.rating || 0;
            const fullStars = Math.floor(rating);
            const emptyStars = 5 - fullStars;

            return (
              <div
                key={product._id}
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-gray-300"
              >
                <Link href={`/products/${product._id}`}>
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      unoptimized
                    />
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                      </span>
                    )}
                  </div>
                </Link>
                <div className="p-2 sm:p-3 md:p-4">
                  <Link href={`/products/${product._id}`}>
                    <h3 className="font-bold text-gray-900 hover:text-black transition text-sm sm:text-base md:text-lg line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-500 capitalize mt-0.5 sm:mt-1">
                    {product.category || 'Uncategorized'}
                  </p>
                  <div className="flex items-center justify-between mt-1 sm:mt-2">
                    <span className="text-base sm:text-xl font-bold text-gray-900">
                      ₹{finalPrice}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded">
                        {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% off
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={addingProductId === product._id}
                    className={`w-full mt-2 sm:mt-3 md:mt-4 bg-gray-900 text-white py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-300 hover:bg-black hover:scale-105 active:scale-95 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
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