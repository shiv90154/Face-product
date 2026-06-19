'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Droplet, Sparkles, Sun, Shield, FlaskConical, 
  Flower2, Leaf, Heart, ArrowRight, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getCategories, getProducts } from '@/lib/api';

// Map categories to professional icons
const categoryIcons = {
  cleansers: Droplet,
  serums: Sparkles,
  moisturizers: Flower2,
  sunscreens: Sun,
  treatments: FlaskConical,
  // default for any other
  default: Leaf
};

export default function ServicesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  // ─── Fetch categories and products ──────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, prods] = await Promise.all([
          getCategories(),
          getProducts()
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ─── Build category items with product counts ───────────
  const categoryItems = categories.map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    slug: cat,
    count: products.filter((p) => p.category === cat).length,
    Icon: categoryIcons[cat] || categoryIcons.default,
  }));

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
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500">No categories available yet.</p>
        <Link href="/" className="mt-4 text-[#1a237e] underline">
          Go back home
        </Link>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold"
          >
            Shop by Category
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-gray-300 text-base md:text-lg mt-3 max-w-2xl mx-auto"
          >
            Discover premium skincare tailored to your needs – from gentle cleansers to advanced treatments.
          </motion.p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
        >
          {categoryItems.map((cat, idx) => {
            const Icon = cat.Icon;
            return (
              <motion.div
                key={cat.slug}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link
                  href={`/services/${cat.slug}`}
                  className="group block bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 text-center transition-all duration-300 hover:shadow-xl hover:border-gray-300"
                >
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gray-100 rounded-full group-hover:bg-gray-900 transition-colors duration-300">
                      <Icon 
                        size={36} 
                        className="text-gray-700 group-hover:text-white transition-colors duration-300" 
                        strokeWidth={1.5}
                      />
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-3">
                    {cat.count} {cat.count === 1 ? 'product' : 'products'}
                  </p>
                  <div className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900 border-b border-gray-300 group-hover:border-gray-900 transition-all group-hover:gap-2">
                    Shop now <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All Products CTA */}
        <div className="text-center mt-12 md:mt-16">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-black hover:scale-105 hover:shadow-lg active:scale-98"
          >
            View All Products
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}