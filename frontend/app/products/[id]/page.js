// app/products/[id]/page.jsx
'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export default function ProductRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  useEffect(() => {
    const redirectToSlug = async () => {
      try {
        // Fetch the product from your backend using the ID
        const res = await fetch(`${API_BASE}/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        const product = data.product || data;  // depends on your API response shape

        if (product?.slug) {
          // Redirect to the clean slug URL
          router.replace(`/product/${product.slug}`);
        } else {
          // Fallback: if no slug, go to main products page
          router.replace('/products');
        }
      } catch (error) {
        console.error('Redirect error:', error);
        router.replace('/products');
      }
    };

    if (id) redirectToSlug();
  }, [id, router]);

  // Show a simple loading spinner while the redirect happens
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
    </div>
  );
}