import { autoCategorize } from './categories'

// ---- Categorization ----
export function categorizeExpense(merchant, note = '') {
  return autoCategorize(merchant + ' ' + note)
}

// ---- Spending analysis ----
export function analyzeSpending(transactions) {
  const byCategory = {}
  let total = 0
  transactions.forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount
    total += t.amount
  })
  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
  return {
    total,
    byCategory,
    topCategory: sorted[0]?.[0] || null,
    topCategoryAmount: sorted[0]?.[1] || 0,
    avgDaily: total / 30,
  }
}

// ---- Simple linear regression forecast ----
export function predictNextMonth(monthlyTotals) {
  // monthlyTotals: array of numbers (oldest -> newest)
  const n = monthlyTotals.length
  if (n === 0) return 0
  if (n === 1) return monthlyTotals[0]
  const xs = monthlyTotals.map((_, i) => i)
  const ys = monthlyTotals
  const xMean = xs.reduce((a, b) => a + b, 0) / n
  const yMean = ys.reduce((a, b) => a + b, 0) / n
  let num = 0, den = 0
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (ys[i] - yMean)
    den += (xs[i] - xMean) ** 2
  }
  const slope = den === 0 ? 0 : num / den
  const intercept = yMean - slope * xMean
  const predicted = slope * n + intercept
  return Math.max(0, Math.round(predicted))
}

// ---- Anomaly detection (z-score based) ----
export function detectAnomalies(transactions) {
  const amounts = transactions.map(t => t.amount)
  const n = amounts.length
  if (n < 3) return []
  const mean = amounts.reduce((a, b) => a + b, 0) / n
  const variance = amounts.reduce((a, b) => a + (b - mean) ** 2, 0) / n
  const std = Math.sqrt(variance) || 1
  return transactions
    .map(t => ({ ...t, zScore: (t.amount - mean) / std }))
    .filter(t => t.zScore > 2)
    .sort((a, b) => b.zScore - a.zScore)
}

// ---- Budget suggestions (50/30/20-ish, based on history) ----
export function suggestBudgets(byCategory, totalIncome) {
  const essentials = ['housing', 'groceries', 'bills', 'health', 'transport']
  const suggestions = {}
  Object.entries(byCategory).forEach(([cat, amount]) => {
    const isEssential = essentials.includes(cat)
    // suggest slightly below current average spend, with a floor
    const suggested = Math.round(amount * (isEssential ? 0.97 : 0.85))
    suggestions[cat] = Math.max(suggested, 20)
  })
  return suggestions
}

// ---- Personalized saving tips ----
export function generateSavingTips(analysis, budgets, transactions) {
  const tips = []
  const { byCategory, total } = analysis

  const subs = transactions.filter(t => t.category === 'subscriptions')
  if (subs.length >= 3) {
    const subTotal = subs.reduce((a, b) => a + b.amount, 0)
    tips.push({
      icon: 'Repeat',
      title: 'Review your subscriptions',
      detail: `You have ${subs.length} active subscriptions costing ₹${subTotal.toFixed(2)}/mo. Cancelling one or two rarely-used ones could save you ₹${(subTotal * 0.3).toFixed(0)}+ monthly.`,
      impact: Math.round(subTotal * 0.3),
    })
  }

  if (byCategory.food && byCategory.food > 350) {
    tips.push({
      icon: 'Utensils',
      title: 'Dining out is adding up',
      detail: `You spent ₹${byCategory.food.toFixed(0)} on food this period. Cooking 2 more meals at home per week could save roughly ₹${Math.round(byCategory.food * 0.2)}/month.`,
      impact: Math.round(byCategory.food * 0.2),
    })
  }

  if (byCategory.shopping && byCategory.shopping > 300) {
    tips.push({
      icon: 'ShoppingBag',
      title: 'Set a shopping cooldown',
      detail: `Impulse shopping totals ₹${byCategory.shopping.toFixed(0)}. Try a 24-hour rule before non-essential purchases over ₹50.`,
      impact: Math.round(byCategory.shopping * 0.15),
    })
  }

  budgets.forEach(b => {
    const spent = byCategory[b.category] || 0
    if (spent > b.limit) {
      tips.push({
        icon: 'AlertTriangle',
        title: `Over budget on ${b.category}`,
        detail: `You've exceeded your ₹${b.limit} budget by ₹${(spent - b.limit).toFixed(0)}. Consider reallocating funds from underused categories.`,
        impact: Math.round(spent - b.limit),
      })
    }
  })

  if (tips.length === 0) {
    tips.push({
      icon: 'ThumbsUp',
      title: 'Great job staying on track!',
      detail: 'Your spending looks balanced across categories. Keep building your emergency fund with the surplus.',
      impact: 0,
    })
  }

  return tips.slice(0, 6)
}

// ---- Chatbot: simple intent matching over local data ----
export function answerChatQuery(query, ctx) {
  const q = query.toLowerCase()
  const { transactions, budgets, goals, income } = ctx
  const analysis = analyzeSpending(transactions)

  const fmt = (n) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`

  if (/how much.*(spend|spent).*(this month|month)/.test(q) || /total spend/.test(q)) {
    return `You've spent ${fmt(analysis.total)} this period across ${Object.keys(analysis.byCategory).length} categories. Your biggest category is ${analysis.topCategory} at ${fmt(analysis.topCategoryAmount)}.`
  }
  if (/top categor|top spending|biggest expense|most.*spend|biggest categor/.test(q)) {
    return `Your top spending category is **${analysis.topCategory}**, totaling ${fmt(analysis.topCategoryAmount)}.`
  }
  if (/budget/.test(q)) {
    const over = budgets.filter(b => (analysis.byCategory[b.category] || 0) > b.limit)
    if (over.length) {
      return `You're over budget in ${over.length} categor${over.length > 1 ? 'ies' : 'y'}: ${over.map(b => b.category).join(', ')}. Want tips to get back on track?`
    }
    return `You're within budget across all ${budgets.length} tracked categories. Nice work!`
  }
  if ((/sav/.test(q) && /goal/.test(q)) || (/how are my/.test(q) && /goal/.test(q))) {
    const g = goals[0]
    return g ? `Your "${g.name}" goal is ${Math.round((g.saved / g.target) * 100)}% funded (${fmt(g.saved)} of ${fmt(g.target)}).` : "You don't have any savings goals set up yet."
  }
  if (/predict|forecast|next month/.test(q)) {
    return `Based on recent trends, I predict you'll spend around ${fmt(analysis.avgDaily * 30)} next month if habits stay similar.`
  }
  if (/unusual|anomal|weird/.test(q)) {
    const anomalies = detectAnomalies(transactions)
    if (anomalies.length) {
      return `I found ${anomalies.length} unusual transaction(s), the largest being ${fmt(anomalies[0].amount)} at ${anomalies[0].merchant}.`
    }
    return "No unusual transactions detected recently — your spending looks consistent."
  }
  if (/income/.test(q)) {
    return `Your recorded income this period is ${fmt(income)}.`
  }
  if (/hello|hi there|hey/.test(q)) {
    return "Hey! I'm your AI expense assistant. Ask me about your spending, budgets, savings goals, or predictions."
  }
  return `Here's a quick snapshot: total spend ${fmt(analysis.total)}, top category ${analysis.topCategory}, average daily spend ${fmt(analysis.avgDaily)}. Ask me something more specific, like "how much did I spend on food" or "am I over budget?"`
}
