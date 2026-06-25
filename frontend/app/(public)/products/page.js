// app/(public)/products/page.js
import ProductsGrid from '@/components/ProductsGrid';

export default function PublicProductsPage() {
  return <ProductsGrid title="All Products" showHeader={true} />;
}