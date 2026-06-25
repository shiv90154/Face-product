// app/(user)/shop/page.js
import ProductsGrid from '@/components/ProductsGrid';

export default function UserShopPage() {
  return <ProductsGrid title="Shop" showHeader={false} showBackButton={true} />;
}