import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumb({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <nav className="bg-white px-4 py-2 flex items-center gap-1 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={index} className="flex items-center gap-1">
            {item.href && !isLast ? (
              <Link href={item.href} className="text-black hover:text-gray-700 transition">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-black font-semibold' : 'text-black'}>
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight size={14} className="text-black" />}
          </span>
        );
      })}
    </nav>
  );
}

