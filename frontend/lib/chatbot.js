// lib/chatbot.js

export const questions = [
  {
    id: 'skin_type',
    text: "What is your skin type?",
    options: ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'],
  },
  {
    id: 'concern',
    text: "What is your main concern?",
    options: [
      'Acne',
      'Aging / Wrinkles',
      'Dark Spots / Pigmentation',
      'Dryness / Dehydration',
      'Dullness / Brightening',
      'Sensitivity / Redness',
    ],
  },
  {
    id: 'budget',
    text: "What is your preferred budget?",
    options: ['Budget Friendly', 'Mid Range', 'Premium', 'No Preference'],
  },
];

// ─── Map budget answers to price ranges ──────────────────
function getBudgetFilter(products, budget) {
  const finalPrice = (p) => p.discountPrice && p.discountPrice > 0 ? p.discountPrice : p.price;

  switch (budget) {
    case 'Budget Friendly':
      return products.filter((p) => finalPrice(p) < 500);
    case 'Mid Range':
      return products.filter((p) => finalPrice(p) >= 500 && finalPrice(p) <= 1500);
    case 'Premium':
      return products.filter((p) => finalPrice(p) > 1500);
    case 'No Preference':
    default:
      return products; // no filtering
  }
}

// ─── Main recommendation function ──────────────────────
export function recommendProducts(products, answers) {
  const { skin_type, concern, budget } = answers;

  // 1. Filter by skin type & concern (as before)
  let suitable = products.filter((product) => {
    const name = product.name?.toLowerCase() || '';
    const category = product.category?.toLowerCase() || '';
    const description = product.description?.toLowerCase() || '';

    // Skin type matching
    let skinMatch = true;
    if (skin_type === 'Oily') {
      skinMatch =
        name.includes('oil-free') ||
        name.includes('mattifying') ||
        category.includes('oil-control') ||
        description.includes('oil control');
    } else if (skin_type === 'Dry') {
      skinMatch =
        name.includes('hydrating') ||
        name.includes('moisturizing') ||
        category.includes('dry skin') ||
        description.includes('dry skin');
    } else if (skin_type === 'Sensitive') {
      skinMatch =
        name.includes('gentle') ||
        name.includes('soothing') ||
        description.includes('sensitive') ||
        description.includes('calming');
    }

    // Concern matching
    let concernMatch = true;
    if (concern?.includes('Acne')) {
      concernMatch =
        name.includes('acne') ||
        name.includes('blemish') ||
        category.includes('treatment') ||
        description.includes('acne');
    } else if (concern?.includes('Aging')) {
      concernMatch =
        name.includes('anti-aging') ||
        name.includes('retinol') ||
        category.includes('serum') ||
        description.includes('aging');
    } else if (concern?.includes('Pigmentation')) {
      concernMatch =
        name.includes('brightening') ||
        name.includes('dark spot') ||
        description.includes('pigment') ||
        category.includes('serum');
    } else if (concern?.includes('Dryness')) {
      concernMatch =
        name.includes('hydrating') ||
        name.includes('moisturizer') ||
        category.includes('moisturizer') ||
        description.includes('hydration');
    } else if (concern?.includes('Brightening')) {
      concernMatch =
        name.includes('bright') ||
        name.includes('glow') ||
        category.includes('serum') ||
        description.includes('brighten');
    }

    return skinMatch && concernMatch;
  });

  // 2. Apply budget filter (if specified)
  suitable = getBudgetFilter(suitable, budget);

  // 3. If still nothing, fallback to top products ignoring budget
  if (suitable.length === 0) {
    suitable = products.slice(0, 4);
  }

  // 4. Sort by rating or soldCount if available
  suitable.sort((a, b) => (b.rating || 0) - (a.rating || 0));

  return suitable.slice(0, 4); // top 4 recommendations
}

