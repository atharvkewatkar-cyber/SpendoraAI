import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import { Wallet, TrendingUp, PiggyBank, Target, Sparkles, ArrowRight, AlertTriangle, Lightbulb } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import StatCard from '../components/StatCard'
import CategoryBadge, { CategoryIconCircle } from '../components/CategoryBadge'
import { formatCurrency, timeAgo } from '../lib/format'
import { getCategory, CATEGORIES } from '../lib/categories'
import { analyzeSpending, detectAnomalies, generateSavingTips, predictNextMonth } from '../lib/ai'

export default function Dashboard() {
  const { transactions, thisMonthTx, totalExpense, totalIncome, totalBudget, budgetLeft, savings, budgets, goals, currency, userName } = useData()
  const { theme } = useTheme()

  const analysis = useMemo(() => analyzeSpending(thisMonthTx), [thisMonthTx])
  const anomalies = useMemo(() => detectAnomalies(thisMonthTx).slice(0, 2), [thisMonthTx])
  const tips = useMemo(() => generateSavingTips(analysis, budgets, thisMonthTx).slice(0, 3), [analysis, budgets, thisMonthTx])

  const last14Days = useMemo(() => {
    const days = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const dayTotal = transactions
        .filter(t => {
          const td = new Date(t.date)
          return td.toDateString() === d.toDateString()
        })
        .reduce((a, b) => a + b.amount, 0)
      days.push({ date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), amount: Math.round(dayTotal) })
    }
    return days
  }, [transactions])

  const categoryData = useMemo(() => {
    return Object.entries(analysis.byCategory)
      .map(([id, value]) => ({ id, name: getCategory(id).label, value: Math.round(value), color: getCategory(id).color }))
      .sort((a, b) => b.value - a.value)
  }, [analysis])

  const budgetProgress = totalBudget > 0 ? Math.min(100, (totalExpense / totalBudget) * 100) : 0
  const forecast = useMemo(() => predictNextMonth(last14Days.map(d => d.amount)), [last14Days])

  const gridColor = theme === 'dark' ? '#1e293b' : '#e2e8f0'
  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, {userName.split(' ')[0]} 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Here's your financial overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        <Link to="/add-expense" className="btn-primary self-start sm:self-auto">
          <Sparkles size={16} /> Add Expense
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Income" value={formatCurrency(totalIncome, currency)} icon="TrendingUp" accent="mint" trend="+4.2% vs last month" trendUp delay={0} />
        <StatCard label="Total Expenses" value={formatCurrency(totalExpense, currency)} icon="Wallet" accent="rose" trend={`${thisMonthTx.length} transactions`} trendUp={false} delay={50} />
        <StatCard label="Savings" value={formatCurrency(savings, currency)} icon="PiggyBank" accent="brand" trend={savings >= 0 ? 'Positive cash flow' : 'Spending exceeds income'} trendUp={savings >= 0} delay={100} />
        <StatCard label="Budget Left" value={formatCurrency(budgetLeft, currency)} icon="Target" accent="amber" trend={`${Math.round(budgetProgress)}% of budget used`} trendUp={budgetProgress < 90} delay={150} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending trend chart */}
        <div className="lg:col-span-2 card p-5 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Spending Trend</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Last 14 days · AI forecast next: {formatCurrency(forecast, currency)}/day avg</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={last14Days}>
              <defs>
                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip
                contentStyle={{ background: theme === 'dark' ? '#0f172a' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 12, fontSize: 12 }}
                formatter={(v) => [formatCurrency(v, currency), 'Spent']}
              />
              <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorAmt)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div className="card p-5 animate-fadeInUp" style={{ animationDelay: '250ms' }}>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">By Category</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">This month</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => formatCurrency(v, currency)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2 max-h-32 overflow-y-auto">
            {categoryData.slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                  {c.name}
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency(c.value, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent transactions */}
        <div className="lg:col-span-2 card p-5 animate-fadeInUp" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">Recent Transactions</h3>
            <Link to="/transactions" className="text-xs font-medium text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.slice(0, 6).map(t => (
              <div key={t.id} className="flex items-center gap-3 py-2.5">
                <CategoryIconCircle categoryId={t.category} size={38} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{t.merchant}</p>
                  <p className="text-xs text-slate-400">{timeAgo(t.date)}</p>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white shrink-0">-{formatCurrency(t.amount, currency)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="card p-5 animate-fadeInUp bg-gradient-to-br from-brand-50/50 to-mint-50/30 dark:from-brand-950/20 dark:to-transparent" style={{ animationDelay: '350ms' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-mint-500 flex items-center justify-center">
              <Sparkles size={15} className="text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">AI Insights</h3>
          </div>

          <div className="space-y-3">
            {anomalies.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
                <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle size={13} /> Unusual spending detected
                </p>
                <p className="text-xs text-rose-600/90 dark:text-rose-400/80 mt-1">
                  {formatCurrency(anomalies[0].amount, currency)} at {anomalies[0].merchant} is much higher than usual.
                </p>
              </div>
            )}
            {tips.slice(0, 2).map((tip, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Lightbulb size={13} className="text-amber-500" /> {tip.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{tip.detail}</p>
              </div>
            ))}
          </div>
          <Link to="/assistant" className="btn-primary w-full mt-4 text-sm py-2">
            Ask AI Assistant <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Goals strip */}
      <div className="card p-5 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900 dark:text-white">Savings Goals</h3>
          <Link to="/goals" className="text-xs font-medium text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline">
            Manage <ArrowRight size={13} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {goals.slice(0, 4).map(g => {
            const pct = Math.min(100, Math.round((g.saved / g.target) * 100))
            return (
              <div key={g.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${g.color}22`, color: g.color }}>
                    <PiggyBank size={15} />
                  </div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{g.name}</p>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: g.color }} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{formatCurrency(g.saved, currency)} of {formatCurrency(g.target, currency)} · {pct}%</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
