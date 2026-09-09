export const CATEGORIES = [
  { id: 'food', label: 'Food & Dining', color: '#f97316', icon: 'Utensils' },
  { id: 'groceries', label: 'Groceries', color: '#22c55e', icon: 'ShoppingCart' },
  { id: 'transport', label: 'Transport', color: '#3b82f6', icon: 'Car' },
  { id: 'shopping', label: 'Shopping', color: '#ec4899', icon: 'ShoppingBag' },
  { id: 'entertainment', label: 'Entertainment', color: '#a855f7', icon: 'Film' },
  { id: 'bills', label: 'Bills & Utilities', color: '#ef4444', icon: 'Receipt' },
  { id: 'health', label: 'Health & Fitness', color: '#14b8a6', icon: 'HeartPulse' },
  { id: 'housing', label: 'Housing & Rent', color: '#6366f1', icon: 'Home' },
  { id: 'education', label: 'Education', color: '#0ea5e9', icon: 'GraduationCap' },
  { id: 'travel', label: 'Travel', color: '#eab308', icon: 'Plane' },
  { id: 'subscriptions', label: 'Subscriptions', color: '#8b5cf6', icon: 'Repeat' },
  { id: 'other', label: 'Other', color: '#64748b', icon: 'MoreHorizontal' },
]

export const getCategory = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1]

export const MERCHANT_CATEGORY_MAP = {
  starbucks: 'food', mcdonalds: 'food', chipotle: 'food', dominos: 'food', swiggy: 'food', zomato: 'food', restaurant: 'food', cafe: 'food', kfc: 'food',
  walmart: 'groceries', 'whole foods': 'groceries', costco: 'groceries', 'trader joe': 'groceries', 'big bazaar': 'groceries', dmart: 'groceries', supermarket: 'groceries', grocery: 'groceries',
  uber: 'transport', lyft: 'transport', shell: 'transport', chevron: 'transport', ola: 'transport', petrol: 'transport', 'gas station': 'transport', metro: 'transport', parking: 'transport',
  amazon: 'shopping', target: 'shopping', ikea: 'shopping', myntra: 'shopping', flipkart: 'shopping', mall: 'shopping', 'h&m': 'shopping', zara: 'shopping',
  netflix: 'subscriptions', spotify: 'subscriptions', 'disney+': 'subscriptions', 'youtube premium': 'subscriptions', 'prime video': 'subscriptions', hotstar: 'subscriptions',
  amc: 'entertainment', cinema: 'entertainment', movie: 'entertainment', concert: 'entertainment', bookmyshow: 'entertainment', game: 'entertainment',
  electricity: 'bills', 'water bill': 'bills', internet: 'bills', 'phone bill': 'bills', wifi: 'bills', utility: 'bills',
  pharmacy: 'health', gym: 'health', doctor: 'health', hospital: 'health', cvs: 'health', clinic: 'health', dental: 'health',
  rent: 'housing', mortgage: 'housing', landlord: 'housing', apartment: 'housing',
  university: 'education', tuition: 'education', course: 'education', udemy: 'education', coursera: 'education', 'book store': 'education',
  airline: 'travel', hotel: 'travel', airbnb: 'travel', flight: 'travel', 'booking.com': 'travel',
}

export function autoCategorize(merchant) {
  const m = (merchant || '').toLowerCase()
  for (const key of Object.keys(MERCHANT_CATEGORY_MAP)) {
    if (m.includes(key)) return MERCHANT_CATEGORY_MAP[key]
  }
  return 'other'
}
