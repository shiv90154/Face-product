'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Truck, Loader2, ArrowLeft } from 'lucide-react';
import { getProducts } from '@/lib/api';
import { addToCart } from '@/lib/cart';
import { toast } from 'react-toastify';

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingProductId, setAddingProductId] = useState(null);

  // ─── Fetch and filter products ──────────────────────────
  useEffect(() => {
    if (!slug) return;

    const fetchProducts = async () => {
      try {
        const allProducts = await getProducts();
        // Case‑insensitive filtering
        const filtered = allProducts.filter(
          (p) => p.category && p.category.toLowerCase() === slug.toLowerCase()
        );
        setProducts(filtered);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [slug]);

  // ─── Add to cart handler ────────────────────────────────
  const handleAddToCart = (product) => {
    setAddingProductId(product._id);
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setAddingProductId(null), 500);
  };

  // ─── Capitalize category name for display ───────────────
  const categoryName = slug
    ? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ')
    : '';

  // ─── Loading state ──────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[#1a237e]" size={40} />
      </div>
    );
  }

  // ─── Error state ────────────────────────────────────────
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

  // ─── Empty state ────────────────────────────────────────
  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">No products in {categoryName}</h2>
        <Link href="/products" className="text-[#1a237e] underline mt-4 inline-block">
          Browse all products
        </Link>
      </div>
    );
  }

  // ─── Render products ────────────────────────────────────
  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with back link */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/services" className="text-gray-600 hover:text-gray-900 transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{categoryName}</h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product, index) => {
            const hasDiscount = product.discountPrice && product.discountPrice < product.price;
            const finalPrice = hasDiscount ? product.discountPrice : product.price;
            const discountPercent = hasDiscount
              ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
              : 0;
            const imageUrl = product.images?.[0] || '/placeholder.png';

            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-all"
              >
                <Link href={`/products/${product._id}`}>
                  <div className="relative aspect-square bg-gray-100">
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="flex items-center bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
                        4.1 <Star size={12} className="ml-0.5 fill-current" />
                      </span>
                      <span className="text-gray-500 text-xs">(49,219)</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-lg font-bold text-gray-900">₹{finalPrice}</span>
                      {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                      )}
                    </div>
                    {product.stock === 0 && (
                      <span className="text-xs text-red-500 font-semibold">Out of Stock</span>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <Truck size={14} className="text-green-600" />
                      <span>Free delivery</span>
                    </div>
                  </div>
                </Link>
                <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0 || addingProductId === product._id}
                    className="w-full bg-[#1a237e] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#0d1757] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingProductId === product._id ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}