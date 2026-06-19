'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { addToCart } from '../frontend/lib/cart';

export default function SerumsPage() {
  const products = getProductsByCategory('serums');
  const [addingProductId, setAddingProductId] = useState(null);
  const lastClickTime = useRef({});

  const handleAddToCart = (product) => {
    const now = Date.now();
    if (lastClickTime.current[product.id] && now - lastClickTime.current[product.id] < 500) return;
    lastClickTime.current[product.id] = now;
    setAddingProductId(product.id);

    addToCart(product);

    alert(`${product.name} added to cart!`);
    setAddingProductId(null);
  };

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-gray-900 text-white py-16 text-center">
        <h1 className="text-4xl font-extrabold capitalize animate-fade-in-up">Serums</h1>
        <p className="text-gray-300 mt-2">Targeted treatments for brightening, aging, and more</p>
      </section>
      <section className="py-16 max-w-7xl mx-auto px-4">
        {products.length === 0 ? (
          <p className="text-center text-gray-500">No products in this category yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product, idx) => (
              <div key={product.id} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1" style={{ animationDelay: `${idx * 50}ms` }}>
                <Link href={`/products/${product.id}`}>
                  <div className="relative h-64 overflow-hidden bg-gray-100">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                </Link>
                <div className="p-5">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-bold text-gray-900 hover:text-black transition-colors">{product.name}</h3>
                  </Link>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                    <div className="flex text-yellow-400 text-sm">
                      {'★'.repeat(Math.floor(product.rating))}
                      {'☆'.repeat(5 - Math.floor(product.rating))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={addingProductId === product.id}
                    className="w-full mt-4 bg-gray-900 text-white py-2 rounded-xl font-semibold transition-all hover:bg-black hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                    {addingProductId === product.id ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}