// lib/likes.js
const LIKES_KEY = 'user_likes';

export function getLikedProductIds() {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(LIKES_KEY);
  return data ? JSON.parse(data) : [];
}

export function toggleLikeProduct(productId) {
  const liked = getLikedProductIds();
  const index = liked.indexOf(productId);
  if (index > -1) {
    liked.splice(index, 1);
  } else {
    liked.push(productId);
  }
  localStorage.setItem(LIKES_KEY, JSON.stringify(liked));
  window.dispatchEvent(new Event('likes-updated'));
}

export function isProductLiked(productId) {
  return getLikedProductIds().includes(productId);
}

export function getLikedProducts(allProducts) {
  const ids = getLikedProductIds();
  return allProducts.filter(p => ids.includes(p._id));
}