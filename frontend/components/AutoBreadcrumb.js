'use client';
import { usePathname } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';   // adjust path if needed

const routeLabels = {
  '/': [{ label: 'Home' }],
  '/products': [
    { label: 'Home', href: '/' },
    { label: 'Products' }
  ],
  '/contact': [
    { label: 'Home', href: '/' },
    { label: 'Contact' }
  ],
  '/services': [
    { label: 'Home', href: '/' },
    { label: 'Services' }
  ],
  '/orders': [
    { label: 'Home', href: '/' },
    { label: 'My Orders' }
  ],
  '/admin': [
    { label: 'Home', href: '/' },
    { label: 'Admin' }
  ],
  '/checkout': [
    { label: 'Home', href: '/' },
    { label: 'Cart', href: '/cart' },
    { label: 'Checkout' }
  ],
  // Add more static routes as you create them
};

export default function AutoBreadcrumb() {
  const pathname = usePathname();

  // Handle dynamic product pages: /product/some-slug
  if (pathname.startsWith('/product/')) {
    return (
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Product' }   // generic placeholder – can be made dynamic later
      ]} />
    );
  }

  const items = routeLabels[pathname];
  if (!items) return null; // no breadcrumb for unmatched routes

  return <Breadcrumb items={items} />;
}

