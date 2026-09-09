// Realistic seeded demo data for SpendoraAI
const MERCHANTS = {
  food: ['Starbucks', 'Chipotle Mexican Grill', "McDonald's", 'Local Cafe', 'Domino\'s Pizza', 'Sushi Palace', 'The Coffee Bean'],
  groceries: ['Whole Foods Market', 'Walmart Supercenter', 'Trader Joe\'s', 'Costco Wholesale', 'Local Farmers Market'],
  transport: ['Uber', 'Lyft', 'Shell Gas Station', 'Metro Transit Card', 'City Parking Authority'],
  shopping: ['Amazon', 'Target', 'IKEA', 'Best Buy', 'Zara', 'H&M'],
  entertainment: ['AMC Theatres', 'Steam Games', 'BookMyShow', 'Local Concert Hall', 'Bowling Alley'],
  bills: ['Pacific Electric Co.', 'CityWater Utility', 'Comcast Internet', 'Verizon Wireless'],
  health: ['CVS Pharmacy', 'Gold\'s Gym', 'City Dental Clinic', 'Walgreens'],
  housing: ['Maple Apartments LLC', 'Home Insurance Co.'],
  education: ['Udemy', 'Coursera', 'University Bookstore'],
  travel: ['Delta Airlines', 'Airbnb', 'Marriott Hotels', 'Booking.com'],
  subscriptions: ['Netflix', 'Spotify Premium', 'Disney+', 'Adobe Creative Cloud', 'iCloud Storage'],
  other: ['ATM Withdrawal', 'Gift Purchase', 'Miscellaneous'],
}

const CATEGORY_WEIGHTS = {
  food: 0.16, groceries: 0.14, transport: 0.09, shopping: 0.13, entertainment: 0.07,
  bills: 0.10, health: 0.06, housing: 0.16, education: 0.03, travel: 0.02,
  subscriptions: 0.03, other: 0.01,
}

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function pick(arr, rand) {
  return arr[Math.floor(rand() * arr.length)]
}

function amountFor(category, rand) {
  const ranges = {
    food: [8, 45], groceries: [25, 140], transport: [6, 60], shopping: [15, 220],
    entertainment: [10, 90], bills: [40, 180], health: [15, 150], housing: [900, 1450],
    education: [20, 300], travel: [80, 650], subscriptions: [6, 20], other: [5, 100],
  }
  const [min, max] = ranges[category] || [5, 100]
  return Math.round((min + rand() * (max - min)) * 100) / 100
}

export function generateDemoTransactions(days = 90) {
  const rand = seededRandom(42)
  const txs = []
  const today = new Date()
  let id = 1

  for (let d = days; d >= 0; d--) {
    const date = new Date(today)
    date.setDate(date.getDate() - d)
    const dayOfMonth = date.getDate()

    // Recurring: rent on 1st, subscriptions spread through month
    if (dayOfMonth === 1) {
      txs.push(mkTx(id++, date, 'housing', 'Maple Apartments LLC', amountFor('housing', rand), 'Monthly rent'))
    }
    if (dayOfMonth === 5) {
      txs.push(mkTx(id++, date, 'bills', 'Pacific Electric Co.', amountFor('bills', rand), 'Electricity bill'))
    }
    if (dayOfMonth === 7) {
      txs.push(mkTx(id++, date, 'subscriptions', 'Netflix', 15.99, 'Monthly subscription'))
      txs.push(mkTx(id++, date, 'subscriptions', 'Spotify Premium', 10.99, 'Monthly subscription'))
    }
    if (dayOfMonth === 12) {
      txs.push(mkTx(id++, date, 'bills', 'Comcast Internet', amountFor('bills', rand), 'Internet bill'))
    }
    if (dayOfMonth === 15) {
      txs.push(mkTx(id++, date, 'health', 'Gold\'s Gym', 45, 'Monthly membership'))
    }

    // Random daily spending (weighted by category)
    const numTx = Math.floor(rand() * 3) // 0-2 random transactions per day
    for (let i = 0; i < numTx; i++) {
      const cat = weightedCategory(rand)
      const merchant = pick(MERCHANTS[cat], rand)
      txs.push(mkTx(id++, date, cat, merchant, amountFor(cat, rand)))
    }

    // Inject a couple of anomalies
    if (d === 23) {
      txs.push(mkTx(id++, date, 'shopping', 'Best Buy', 890, 'Laptop purchase'))
    }
    if (d === 47) {
      txs.push(mkTx(id++, date, 'travel', 'Delta Airlines', 620, 'Flight booking'))
    }
  }

  // Income entries (twice a month)
  const incomes = []
  let incId = 1
  for (let m = 3; m >= 0; m--) {
    const d1 = new Date(today.getFullYear(), today.getMonth() - m, 1)
    const d15 = new Date(today.getFullYear(), today.getMonth() - m, 15)
    incomes.push({ id: `inc-${incId++}`, date: d1.toISOString(), source: 'Salary - TechCorp Inc.', amount: 3200, type: 'income' })
    incomes.push({ id: `inc-${incId++}`, date: d15.toISOString(), source: 'Salary - TechCorp Inc.', amount: 3200, type: 'income' })
  }
  incomes.push({ id: `inc-${incId++}`, date: new Date(today.getFullYear(), today.getMonth(), 20).toISOString(), source: 'Freelance Project', amount: 450, type: 'income' })

  return { transactions: txs.sort((a, b) => new Date(b.date) - new Date(a.date)), incomes }
}

function weightedCategory(rand) {
  const r = rand()
  let acc = 0
  for (const [cat, w] of Object.entries(CATEGORY_WEIGHTS)) {
    acc += w
    if (r <= acc) return cat
  }
  return 'other'
}

function mkTx(id, date, category, merchant, amount, note = '') {
  return {
    id: `tx-${id}`,
    date: date.toISOString(),
    category,
    merchant,
    amount,
    note,
    type: 'expense',
    paymentMethod: pick(['Credit Card', 'Debit Card', 'Cash', 'UPI'], seededRandom(id)),
  }
}

export const DEMO_BUDGETS = [
  { id: 'b1', category: 'food', limit: 450, period: 'monthly' },
  { id: 'b2', category: 'groceries', limit: 500, period: 'monthly' },
  { id: 'b3', category: 'transport', limit: 200, period: 'monthly' },
  { id: 'b4', category: 'shopping', limit: 350, period: 'monthly' },
  { id: 'b5', category: 'entertainment', limit: 150, period: 'monthly' },
  { id: 'b6', category: 'bills', limit: 350, period: 'monthly' },
  { id: 'b7', category: 'health', limit: 120, period: 'monthly' },
  { id: 'b8', category: 'subscriptions', limit: 60, period: 'monthly' },
]

export const DEMO_GOALS = [
  { id: 'g1', name: 'Emergency Fund', target: 10000, saved: 6450, deadline: addMonths(6), icon: 'ShieldCheck', color: '#22c55e' },
  { id: 'g2', name: 'Japan Trip 2027', target: 4500, saved: 1820, deadline: addMonths(9), icon: 'Plane', color: '#f59e0b' },
  { id: 'g3', name: 'New MacBook Pro', target: 2500, saved: 2500, deadline: addMonths(1), icon: 'Laptop', color: '#3b82f6' },
  { id: 'g4', name: 'Home Down Payment', target: 50000, saved: 12300, deadline: addMonths(30), icon: 'Home', color: '#8b5cf6' },
]

function addMonths(n) {
  const d = new Date()
  d.setMonth(d.getMonth() + n)
  return d.toISOString()
}
