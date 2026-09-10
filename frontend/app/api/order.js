const BASE = '';

export const createOrder = async (orderData) => {
  const res = await fetch(`${BASE}/api/orders/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Order creation failed');
  return data;
};

export const getUserOrders = async (email) => {
  const res = await fetch(`${BASE}/api/orders/user/${encodeURIComponent(email)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');
  return data;
};

export const cancelOrder = async (orderId) => {
  const res = await fetch(`${BASE}/api/orders/${orderId}/cancel`, {
    method: 'PATCH',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Cancel failed');
  return data;
};

