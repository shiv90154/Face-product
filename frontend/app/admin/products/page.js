'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Plus, Package, Loader2 } from 'lucide-react';
import { getProducts, deleteProduct } from '@/lib/api';
import { toast } from 'react-toastify';

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // ─── Check admin login ──────────────────────────────────
  useEffect(() => {
    const admin = localStorage.getItem('adminLoggedIn');
    if (admin !== 'true') {
      router.push('/admin/login');
      return;
    }
    fetchProducts();
  }, [router]);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setDeletingId(id);
    try {
      await deleteProduct(id);
      toast.success('Product deleted successfully');
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      toast.error('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[#1a237e]" size={40} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="text-[#1a237e]" size={28} />
            Products
          </h1>
          <Link
            href="/admin/products/add"
            className="flex items-center gap-2 bg-[#1a237e] text-white px-4 py-2 rounded-lg hover:bg-[#0d1757] transition"
          >
            <Plus size={18} />
            Add Product
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-gray-700 font-semibold">Image</th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">Name</th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">Price</th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">Stock</th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">Category</th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">Status</th>
                  <th className="px-4 py-3 text-gray-700 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      No products found. Create your first product!
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                              <Package size={20} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                        {product.name}
                      </td>
                      <td className="px-4 py-3">₹{product.price}</td>
                      <td className="px-4 py-3">
                        <span
                          className={product.stock > 0 ? 'text-green-600' : 'text-red-500'}
                        >
                          {product.stock > 0 ? product.stock : 'Out of stock'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{product.category || '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            product.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/admin/products/edit/${product._id}`}
                            className="text-blue-600 hover:text-blue-800 transition"
                          >
                            <Pencil size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id)}
                            disabled={deletingId === product._id}
                            className="text-red-500 hover:text-red-700 transition disabled:opacity-50"
                          >
                            {deletingId === product._id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}