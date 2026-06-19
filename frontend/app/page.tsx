'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sectionsRef = useRef([]);

  // ─── Fetch products ──────────────────────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${API_BASE}/products`);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        // Show featured products first, otherwise first 4
        const featured = data.products?.filter((p) => p.isFeatured) || [];
        const fallback = data.products?.slice(0, 4) || [];
        setProducts(featured.length > 0 ? featured : fallback);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ─── Intersection Observer for scroll animations ──────
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [products]); // re-run when products load (so sections are ready)

  const addToRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
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

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {/* ─── HERO ────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-gray-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                Glow Naturally
                <span className="block text-gray-300 text-2xl md:text-3xl mt-2">with Clean Beauty</span>
              </h1>
              <p className="text-base md:text-lg text-gray-200 mt-4 mb-6 max-w-lg mx-auto md:mx-0">
                Dermatologist‑tested, cruelty‑free skincare that transforms your skin.
                Join 10,000+ happy customers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  href="/products"
                  className="group relative inline-flex items-center justify-center px-6 py-2.5 text-base font-bold text-gray-900 bg-white rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl"
                >
                  <span className="relative z-10">Shop Now</span>
                  <span className="absolute inset-0 bg-gray-100 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center px-6 py-2.5 text-base font-semibold text-white border-2 border-white rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 hover:scale-105"
                >
                  Explore Services
                </Link>
              </div>
            </div>
            <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
              <Image
                src="https://picsum.photos/id/104/800/800"
                alt="Skincare routine"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────────────── */}
      <section ref={addToRefs} className="py-16 md:py-20 bg-white animate-on-scroll">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900">Why You'll Love Us</h2>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto text-sm md:text-base">Clean ingredients, sustainable packaging, and real results.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              { title: 'Cruelty‑Free', desc: 'Never tested on animals. Leaping Bunny certified.', icon: '🐰', bg: 'bg-pink-50' },
              { title: 'Dermatologist Tested', desc: 'Approved by skin experts for safety & efficacy.', icon: '👩‍⚕️', bg: 'bg-blue-50' },
              { title: 'Eco‑Friendly', desc: 'Recyclable packaging & carbon‑neutral shipping.', icon: '🌱', bg: 'bg-green-50' },
            ].map((feat, idx) => (
              <div
                key={idx}
                className={`group p-6 md:p-8 rounded-2xl text-center transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${feat.bg}`}
              >
                <div className="text-5xl md:text-6xl mb-3 md:mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">{feat.icon}</div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">{feat.title}</h3>
                <p className="text-gray-600 mt-2 text-sm md:text-base">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PRODUCTS ───────────────────────────── */}
      <section ref={addToRefs} className="py-12 md:py-20 bg-gray-50 animate-on-scroll">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900">Bestsellers</h2>
            <p className="text-gray-600 mt-2 text-sm md:text-base">Loved by thousands – shop our most popular picks</p>
          </div>

          {products.length === 0 ? (
            <p className="text-center text-gray-500">No products available yet.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
              {products.map((product, idx) => {
                const imageUrl = product.images?.[0] || '/placeholder.png';
                const hasDiscount = product.discountPrice && product.discountPrice < product.price;
                const finalPrice = hasDiscount ? product.discountPrice : product.price;

                return (
                  <div
                    key={product._id}
                    className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                    style={{ transitionDelay: `${idx * 100}ms` }}
                  >
                    <Link href={`/products/${product._id}`}>
                      <div className="relative h-40 sm:h-56 md:h-64 overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                      </div>
                    </Link>
                    <div className="p-2 sm:p-4 md:p-5">
                      <span className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {product.category || 'Uncategorized'}
                      </span>
                      <Link href={`/products/${product._id}`}>
                        <h3 className="font-bold text-sm sm:text-lg md:text-xl text-gray-900 mt-0.5 sm:mt-1 hover:text-gray-700 transition line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex justify-between items-center mt-1 sm:mt-2 md:mt-3">
                        <span className="text-sm sm:text-xl md:text-2xl font-black text-gray-900">
                          ₹{finalPrice}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded">
                            {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% off
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => alert(`${product.name} added to cart!`)}
                        className="w-full mt-2 sm:mt-4 md:mt-5 bg-gray-900 text-white py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm md:text-base transition-all duration-300 hover:bg-black hover:scale-[1.02] hover:shadow-lg active:scale-95"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-8 md:mt-12">
            <Link
              href="/products"
              className="inline-block border-2 border-gray-900 text-gray-900 px-6 md:px-8 py-2 md:py-3 rounded-full font-semibold text-sm md:text-base transition-all duration-300 hover:bg-gray-900 hover:text-white hover:scale-105 hover:shadow-lg"
            >
              View All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIAL ──────────────────────────────────── */}
      <section ref={addToRefs} className="py-16 md:py-20 bg-white relative overflow-hidden animate-on-scroll">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-transparent to-transparent"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <div className="text-7xl md:text-8xl text-gray-200 mb-3 md:mb-4">“</div>
          <p className="text-xl md:text-2xl text-gray-800 italic font-light leading-relaxed">
            “My skin has never looked better. The Vitamin C serum is a game‑changer – 
            bright, even tone and zero irritation. I’m a customer for life.”
          </p>
          <div className="mt-6 md:mt-8">
            <div className="flex justify-center gap-1 text-yellow-400 text-xl md:text-2xl">★★★★★</div>
            <p className="font-bold text-gray-900 mt-3 text-base md:text-lg">— Jessica T.</p>
            <p className="text-gray-500 text-sm">Verified Buyer · 2 weeks ago</p>
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER ───────────────────────────────────── */}
      <section ref={addToRefs} className="py-16 md:py-20 bg-gray-900 text-white animate-on-scroll">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold">Ready to glow?</h2>
          <p className="text-gray-300 mt-2 md:mt-3 mb-6 md:mb-8 text-sm md:text-base">Sign up for 15% off your first order + skincare tips.</p>
          <form className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 md:px-5 py-2.5 md:py-3 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm md:text-base"
              required
            />
            <button
              type="submit"
              className="px-6 md:px-8 py-2.5 md:py-3 bg-white text-gray-900 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-gray-100 text-sm md:text-base"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-4">No spam. Unsubscribe anytime.</p>
        </div>
      </section>
    </div>
  );
}