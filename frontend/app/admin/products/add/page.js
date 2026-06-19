"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Loader2,
  CheckCircle,
  ArrowLeft,
  Plus,
  X,
  Package,
  DollarSign,
  Image as ImageIcon,
  Truck,
  Shield,
  Star,
  Eye,
  UploadCloud,
} from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";

const CATEGORIES = ["cleansers", "serums", "moisturizers", "sunscreens", "treatments"];

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    description: "",
    shortDescription: "",
    brand: "Face Products",
    category: "",
    subCategory: "",
    price: "",
    discountPrice: "",
    stock: "",
    sku: "",
    weight: "",
    tags: "",
    isFeatured: false,
    isActive: true,
  });

  // Image files and previews
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Auth check
  useEffect(() => {
    const admin = localStorage.getItem("adminLoggedIn");
    if (admin !== "true") router.push("/admin/login");
  }, [router]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  // Input classes with black text
  const inputCls = (field) =>
    `w-full border rounded-lg p-2.5 text-sm text-gray-900 placeholder:text-gray-400 ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-300"
    } focus:ring-2 focus:ring-[#1a237e]/20 focus:border-[#1a237e] transition`;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ---- Image handling ----
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (imageFiles.length + files.length > 5) {
      toast.warning("Maximum 5 images allowed");
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setImageFiles((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  // ---- Validation ----
  const validate = () => {
    const err = {};
    if (!form.name.trim()) err.name = "Product name is required";
    if (!form.description.trim()) err.description = "Description is required";
    if (!form.category) err.category = "Category is required";
    if (!form.price || parseFloat(form.price) <= 0)
      err.price = "Price must be greater than 0";
    if (form.discountPrice && parseFloat(form.discountPrice) >= parseFloat(form.price))
      err.discountPrice = "Discount must be less than price";
    if (imageFiles.length === 0) err.images = "At least one image is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ---- Submit ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // 1. Upload images
      let imageUrls = [];
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append("images", file));

        const uploadRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Image upload failed");
        imageUrls = uploadData.urls;
      }

      // 2. Create product
      const payload = {
        ...form,
        price: parseFloat(form.price),
        discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : 0,
        stock: parseInt(form.stock) || 0,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        images: imageUrls,
      };
      if (!payload.sku) delete payload.sku;
      if (!payload.weight) delete payload.weight;

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create product");
      toast.success("Product created successfully!");
      router.push("/admin/dashboard");
    } catch (error) {
      toast.error(error.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  // ---- Preview calculations ----
  const hasDiscount = form.discountPrice && parseFloat(form.discountPrice) > 0;
  const finalPrice = hasDiscount ? parseFloat(form.discountPrice) : parseFloat(form.price) || 0;
  const originalPrice = parseFloat(form.price) || 0;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;
  const previewImage = imagePreviews.length > 0 ? imagePreviews[0] : null;

  // ---- Live Preview Component ----
  const ProductPreview = () => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
      <div className="relative h-48 bg-gray-100 flex items-center justify-center">
        {previewImage ? (
          <Image
            src={previewImage}
            alt={form.name || "Product preview"}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <ImageIcon size={48} strokeWidth={1.5} />
            <span className="text-sm mt-2">No image</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base line-clamp-1">
          {form.name || "Product Name"}
        </h3>
        <div className="flex items-center gap-1 mt-1">
          <span className="flex items-center bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
            4.1 <Star size={12} className="ml-0.5 fill-current" />
          </span>
          <span className="text-gray-500 text-xs">(49,219)</span>
          <span className="ml-2 text-green-700 text-xs font-medium border border-green-200 px-1.5 rounded">
            Assured
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xl font-bold text-gray-900">
            ₹{finalPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-sm text-gray-400 line-through">
                ₹{originalPrice.toFixed(2)}
              </span>
              <span className="text-sm text-green-600 font-semibold">
                {discountPercent}% off
              </span>
            </>
          )}
        </div>
        {hasDiscount && (
          <div className="mt-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full inline-block">
            WOW! Buy at ₹{finalPrice.toFixed(2)}
          </div>
        )}
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500 border-t pt-2">
          <Truck size={14} className="text-green-600" />
          <span className="font-medium text-green-700">EXPRESS</span>
          <span>•</span>
          <span>Delivery in 2 days</span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs">
          <span className="text-gray-500">Stock:</span>
          <span className={parseInt(form.stock) > 0 ? "text-green-700" : "text-red-500"}>
            {parseInt(form.stock) > 0 ? `${form.stock} units` : "Out of stock"}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/admin/dashboard"
            className="text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={22} />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="text-[#1a237e]" size={28} />
            Add New Product
          </h1>
        </div>

        {/* Two‑column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT – Form (all fields visible) */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* ---------- BASIC INFO ---------- */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b pb-3 mb-5">
                    <span className="w-1 h-6 bg-[#1a237e] rounded-full" />
                    Basic Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className={inputCls("name")}
                        placeholder="e.g. Vitamin C Serum"
                        required
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        rows="4"
                        value={form.description}
                        onChange={handleChange}
                        className={inputCls("description") + " resize-y"}
                        placeholder="Detailed product description..."
                        required
                      />
                      {errors.description && (
                        <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Short Description
                      </label>
                      <input
                        type="text"
                        name="shortDescription"
                        value={form.shortDescription}
                        onChange={handleChange}
                        className={inputCls("shortDescription")}
                        placeholder="Brief summary (max 300 chars)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Brand
                      </label>
                      <input
                        type="text"
                        name="brand"
                        value={form.brand}
                        onChange={handleChange}
                        className={inputCls("brand")}
                        placeholder="e.g. Face Products"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className={inputCls("category")}
                        required
                      >
                        <option value="">Select category</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Sub‑category
                      </label>
                      <input
                        type="text"
                        name="subCategory"
                        value={form.subCategory}
                        onChange={handleChange}
                        className={inputCls("subCategory")}
                        placeholder="e.g. Anti-aging"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        name="tags"
                        value={form.tags}
                        onChange={handleChange}
                        className={inputCls("tags")}
                        placeholder="e.g. organic, vegan, new"
                      />
                    </div>
                  </div>
                </section>

                {/* ---------- PRICING & STOCK ---------- */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b pb-3 mb-5">
                    <DollarSign className="text-[#1a237e]" size={20} />
                    Pricing & Stock
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        className={inputCls("price")}
                        placeholder="0.00"
                        required
                      />
                      {errors.price && (
                        <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Discount Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="discountPrice"
                        value={form.discountPrice}
                        onChange={handleChange}
                        className={inputCls("discountPrice")}
                        placeholder="0.00"
                      />
                      {errors.discountPrice && (
                        <p className="text-red-500 text-xs mt-1">{errors.discountPrice}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={form.stock}
                        onChange={handleChange}
                        className={inputCls("stock")}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        SKU (unique)
                      </label>
                      <input
                        type="text"
                        name="sku"
                        value={form.sku}
                        onChange={handleChange}
                        className={inputCls("sku")}
                        placeholder="e.g. SKU-001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-800 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="weight"
                        value={form.weight}
                        onChange={handleChange}
                        className={inputCls("weight")}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </section>

                {/* ---------- IMAGES (now at the bottom) ---------- */}
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 border-b pb-3 mb-5">
                    <ImageIcon className="text-[#1a237e]" size={20} />
                    Product Images
                    <span className="ml-auto text-xs text-gray-400">Max 5</span>
                  </h2>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />

                  <div
                    onClick={triggerFileInput}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#1a237e] transition cursor-pointer"
                  >
                    <UploadCloud className="mx-auto text-gray-400" size={32} />
                    <p className="mt-2 text-sm text-gray-600">Click to select images</p>
                    <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 5MB each</p>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {imagePreviews.map((src, idx) => (
                        <div key={idx} className="relative group">
                          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                            <Image
                              src={src}
                              alt={`Preview ${idx + 1}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(idx);
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.images && (
                    <p className="text-red-500 text-xs mt-1">{errors.images}</p>
                  )}
                </section>

                {/* ---------- FEATURED / ACTIVE ---------- */}
                <section className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-800 hover:text-gray-900 transition">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={form.isFeatured}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#1a237e] rounded focus:ring-[#1a237e]"
                    />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-800 hover:text-gray-900 transition">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                      className="w-4 h-4 text-[#1a237e] rounded focus:ring-[#1a237e]"
                    />
                    Active
                  </label>
                </section>

                {/* ---------- SUBMIT ---------- */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Link
                    href="/admin/dashboard"
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-[#1a237e] hover:bg-[#0d1757] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition shadow-sm hover:shadow disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <CheckCircle size={18} />
                    )}
                    {loading ? "Creating..." : "Create Product"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* RIGHT – Live Preview (sticky) */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="sticky top-24"
            >
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-2 border-b pb-3 mb-4">
                  <Eye className="text-[#1a237e]" size={18} />
                  <h3 className="font-semibold text-gray-900">Live Preview</h3>
                  <span className="ml-auto text-xs text-gray-400">auto‑updates</span>
                </div>
                <ProductPreview />
                <div className="mt-3 text-xs text-gray-400 text-center">
                  This is how the product will appear to customers.
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Trust footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400 border-t pt-4">
          <Shield size={14} />
          <span>Safe and secure data handling. All product information is encrypted.</span>
        </div>
      </div>
    </div>
  );
}