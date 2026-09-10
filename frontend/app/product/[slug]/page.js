// app/product/[slug]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/footer';
import { Minus, Plus, Star, ShoppingCart, ChevronRight } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE}/products/slug/${slug}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        const prod = data.product || data;
        if (prod) {
          setProduct(prod);
          addToRecentlyViewed(prod);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchProduct();
  }, [slug]);

  const addToRecentlyViewed = (p) => {
    let recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    recent = recent.filter(item => item._id !== p._id);
    recent.unshift({
      _id: p._id,
      name: p.name,
      image: p.images?.[0],
      slug: p.slug,
      price: p.price,
      discountPrice: p.discountPrice,
    });
    recent = recent.slice(0, 8);
    localStorage.setItem('recentlyViewed', JSON.stringify(recent));
  };

  const handleAddToCart = () => {
    if (!product) return;
    setAddingToCart(true);
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex(item => item.id === product._id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        id: product._id,
        name: product.name,
        price: product.discountPrice || product.price,
        image: product.images?.[0] || '/placeholder.png',
        quantity,
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    setTimeout(() => setAddingToCart(false), 800);
  };

  if (loading) {
    return (
      <>

        <Header />
        <Breadcrumb items={[{ label: 'Home' }]} />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <p className="text-red-500 text-lg">{error || 'Product not found'}</p>
          <Link href="/products" className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-900 transition">
            Back to Products
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <>
      <Header />

      <main className="bg-white min-h-screen pb-16">
        {/* Breadcrumb */}
        <div className="max-w-6xl mx-auto px-4 pt-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-black">Home</Link>
          <ChevronRight size={14} />
          <Link href="/products" className="hover:text-black">Products</Link>
          <ChevronRight size={14} />
          <span className="text-black font-medium truncate">{product.name}</span>
        </div>

        {/* Product Section */}
        <div className="max-w-6xl mx-auto px-4 mt-6 grid md:grid-cols-2 gap-8">
          {/* Image Gallery - reduced height */}
          <div>
            <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden bg-gray-50">
              <Image
                src={product.images?.[selectedImage] || '/placeholder.png'}
                alt={product.name}
                fill
                className="object-cover"
                unoptimized
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{discountPercentage}%
                </span>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition ${
                      idx === selectedImage ? 'border-black' : 'border-gray-200'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info - reduced font sizes */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>
            <p className="text-gray-500 mt-2 text-sm md:text-base">{product.shortDescription}</p>

            {product.rating > 0 && (
              <div className="flex items-center gap-2 mt-4">
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  {product.rating} ({product.totalReviews || 0} reviews)
                </span>
              </div>
            )}

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-gray-900">₹{displayPrice.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-lg text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
              )}
              {hasDiscount && (
                <span className="text-green-600 font-semibold text-sm">Save {discountPercentage}%</span>
              )}
            </div>

            <div className="mt-3">
              {product.stock > 0 ? (
                <span className="text-green-600 font-medium text-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-600 rounded-full inline-block" />
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-red-600 font-medium text-sm">Out of Stock</span>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center border border-gray-300 text-black rounded-full">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 px-3 hover:bg-gray-100 rounded-l-full transition"
                  disabled={product.stock === 0}
                >
                  <Minus size={14} />
                </button>
                <span className="px-3 text-base font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 px-3 hover:bg-gray-100 rounded-r-full transition"
                  disabled={product.stock === 0}
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addingToCart}
                className="flex-1 min-w-[180px] bg-black text-white px-5 py-2.5 rounded-full font-semibold hover:bg-gray-900 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                <ShoppingCart size={16} />
                {addingToCart ? 'Added ✓' : 'Add to Cart'}
              </button>
            </div>

            <div className="mt-6 border-t pt-6 space-y-3">
              {product.brand && (
                <div className="flex gap-2 text-sm">
                  <span className="font-medium text-gray-900">Brand:</span>
                  <span className="text-gray-600">{product.brand}</span>
                </div>
              )}
              {product.category && (
                <div className="flex gap-2 text-sm">
                  <span className="font-medium text-gray-900">Category:</span>
                  <span className="text-gray-600 capitalize">{product.category}</span>
                </div>
              )}
              {product.sku && (
                <div className="flex gap-2 text-sm">
                  <span className="font-medium text-gray-900">SKU:</span>
                  <span className="text-gray-600">{product.sku}</span>
                </div>
              )}
              {product.tags?.length > 0 && (
                <div className="flex gap-2 text-sm flex-wrap">
                  <span className="font-medium text-gray-900">Tags:</span>
                  <div className="flex gap-1">
                    {product.tags.map(tag => (
                      <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <section className="max-w-6xl mx-auto px-4 mt-12">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Description</h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed text-sm md:text-base">
            {product.description}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}