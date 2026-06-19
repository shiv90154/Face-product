import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
    },
    brand: {
      type: String,
      default: "Face Products",
    },
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      default: 0,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,   // ← allow multiple nulls
    },
    weight: {
      type: Number,
    },
    tags: [
      {
        type: String,
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Pre‑save hook to generate unique slug ──────────────
productSchema.pre('save', async function () {
  if (!this.slug && this.name) {
    const baseSlug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const Product = this.constructor;
    let slug = baseSlug;
    let counter = 1;

    let existing = await Product.findOne({ slug });
    while (existing) {
      slug = `${baseSlug}-${counter}`;
      existing = await Product.findOne({ slug });
      counter++;
    }
    this.slug = slug;
  }
});

const Product = mongoose.model("Product", productSchema);
export default Product;