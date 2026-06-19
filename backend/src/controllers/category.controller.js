import Product from "../models/product.model.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    const filtered = categories.filter((cat) => cat).sort();
    res.status(200).json({ success: true, categories: filtered });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};