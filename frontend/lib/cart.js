// lib/cart.js

// ─── Get cart from localStorage ──────────────────────────
export const getCart = () => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('cart');
  return stored ? JSON.parse(stored) : [];
};

// ─── Save cart and dispatch update event ──────────────
export const saveCart = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
};

// ─── Add product to cart (with proper fields) ──────────
export const addToCart = (product) => {
  const cart = getCart();

  // Use the product's _id as the unique identifier
  const existingIndex = cart.findIndex(item => item.id === product._id);

  let newCart;
  if (existingIndex !== -1) {
    // Increase quantity
    newCart = [...cart];
    newCart[existingIndex] = {
      ...newCart[existingIndex],
      quantity: newCart[existingIndex].quantity + 1,
    };
  } else {
    // ─── Extract first image or fallback to null ──────
    const imageUrl = product.images && product.images.length > 0
      ? product.images[0]
      : null;

    const hasDiscount = product.discountPrice && product.discountPrice < product.price;

    // ─── Store only what CartPage needs ──────────────
    const cartItem = {
      id: product._id,               // ← store as 'id' for CartPage
      name: product.name,
      image: imageUrl,               // ← store the image URL
      quantity: 1,
      stock: product.stock,
      price: product.price,
      discountPrice: hasDiscount ? product.discountPrice : null,
    };

    newCart = [...cart, cartItem];
  }

  saveCart(newCart);
  return newCart;
};

// ─── Update quantity ────────────────────────────────────
export const updateQuantity = (id, newQty) => {
  const cart = getCart();
  if (newQty < 1) {
    const filtered = cart.filter(item => item.id !== id);
    saveCart(filtered);
    return filtered;
  }
  const updated = cart.map(item =>
    item.id === id ? { ...item, quantity: newQty } : item
  );
  saveCart(updated);
  return updated;
};

// ─── Remove item ────────────────────────────────────────
export const removeItem = (id) => {
  const cart = getCart();
  const filtered = cart.filter(item => item.id !== id);
  saveCart(filtered);
  return filtered;
};