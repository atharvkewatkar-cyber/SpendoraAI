import { useMemo, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import { formatCurrency } from '../lib/format'
import { getCategory } from '../lib/categories'
import { analyzeSpending, detectAnomalies, predictNextMonth } from '../lib/ai'
import { CategoryIconCircle } from '../components/CategoryBadge'

export default function Analytics() {
  const { transactions, currency } = useData()
  const { theme } = useTheme()
  const [range, setRange] = useState(90)

  const gridColor = theme === 'dark' ? '#1e293b' : '#e2e8f0'
  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b'

  const rangedTx = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - range)
    return transactions.filter(t => new Date(t.date) >= cutoff)
  }, [transactions, range])

  const analysis = useMemo(() => analyzeSpending(rangedTx), [rangedTx])
  const anomalies = useMemo(() => detectAnomalies(rangedTx), [rangedTx])

  const monthlyData = useMemo(() => {
    const months = {}
    transactions.forEach(t => {
      const d = new Date(t.date)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      const label = d.toLocaleDateString('en-US', { month: 'short' })
      if (!months[key]) months[key] = { label, total: 0, sortKey: d.getFullYear() * 12 + d.getMonth() }
      months[key].total += t.amount
    })
    return Object.values(months).sort((a, b) => a.sortKey - b.sortKey).slice(-6).map(m => ({ ...m, total: Math.round(m.total) }))
  }, [transactions])

  const forecast = useMemo(() => predictNextMonth(monthlyData.map(m => m.total)), [monthlyData])

  const categoryData = useMemo(() => {
    return Object.entries(analysis.byCategory)
      .map(([id, value]) => ({ id, name: getCategory(id).label, value: Math.round(value), color: getCategory(id).color }))
      .sort((a, b) => b.value - a.value)
  }, [analysis])

  const radarData = useMemo(() => {
    return categoryData.slice(0, 6).map(c => ({ category: c.name, amount: c.value }))
  }, [categoryData])

  const weekdayData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const totals = new Array(7).fill(0)
    rangedTx.forEach(t => { totals[new Date(t.date).getDay()] += t.amount })
    return days.map((d, i) => ({ day: d, amount: Math.round(totals[i]) }))
  }, [rangedTx])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Deep insights into your spending patterns</p>
        </div>
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          {[30, 90, 180].map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${range === r ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500'}`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 animate-fadeInUp">
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Spent ({range}d)</p>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{formatCurrency(analysis.total, currency)}</p>
        </div>
        <div className="card p-5 animate-fadeInUp" style={{ animationDelay: '50ms' }}>
          <p className="text-sm text-slate-500 dark:text-slate-400">Avg Daily Spend</p>
          <p className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{formatCurrency(analysis.total / range, currency)}</p>
        </div>
        <div className="card p-5 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1"><TrendingUp size={13}/> Predicted Next Month</p>
          <p className="text-2xl font-bold mt-1 text-brand-600 dark:text-brand-400">{formatCurrency(forecast, currency)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 animate-fadeInUp">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">6-Month Trend & Forecast</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={[...monthlyData, { label: 'Next', total: forecast, forecast: true }]}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={v => formatCurrency(v, currency)} contentStyle={{ borderRadius: 12, fontSize: 12, background: theme === 'dark' ? '#0f172a' : '#fff', border: `1px solid ${gridColor}` }} />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5 animate-fadeInUp" style={{ animationDelay: '50ms' }}>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Spending by Weekday</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weekdayData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={v => formatCurrency(v, currency)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Category Radar</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={gridColor} />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fill: textColor }} />
              <PolarRadiusAxis tick={{ fontSize: 9, fill: textColor }} />
              <Radar dataKey="amount" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
              <Tooltip formatter={v => formatCurrency(v, currency)} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5 animate-fadeInUp" style={{ animationDelay: '150ms' }}>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={95} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={v => formatCurrency(v, currency)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Anomalies */}
      <div className="card p-5 animate-fadeInUp">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <AlertTriangle size={16} className="text-rose-500" /> Anomaly Detection
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Transactions flagged as statistically unusual (z-score &gt; 2)</p>
        {anomalies.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No anomalies detected in this period. Your spending looks consistent.</p>
        ) : (
          <div className="space-y-2">
            {anomalies.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
                <CategoryIconCircle categoryId={a.category} size={36} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{a.merchant}</p>
                  <p className="text-xs text-slate-400">{new Date(a.date).toLocaleDateString()}</p>
                </div>
                <span className="text-sm font-semibold text-rose-600">{formatCurrency(a.amount, currency)}</span>
                <span className="badge bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 text-[10px]">
                  {a.zScore.toFixed(1)}σ
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
