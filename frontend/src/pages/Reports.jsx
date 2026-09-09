import { useMemo, useState } from 'react'
import { FileText, Download, Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useData } from '../context/DataContext'
import { useTheme } from '../context/ThemeContext'
import { formatCurrency } from '../lib/format'
import { getCategory } from '../lib/categories'
import { analyzeSpending, generateSavingTips } from '../lib/ai'

const PERIODS = [
  { id: 'this-month', label: 'This Month' },
  { id: 'last-month', label: 'Last Month' },
  { id: 'last-3-months', label: 'Last 3 Months' },
  { id: 'year', label: 'This Year' },
]

export default function Reports() {
  const { transactions, incomes, budgets, currency } = useData()
  const { theme } = useTheme()
  const [period, setPeriod] = useState('this-month')

  const gridColor = theme === 'dark' ? '#1e293b' : '#e2e8f0'
  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b'

  const { rangeTx, rangeIncome, label } = useMemo(() => {
    const now = new Date()
    let start, end = now
    let label = ''
    if (period === 'this-month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      label = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    } else if (period === 'last-month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      end = new Date(now.getFullYear(), now.getMonth(), 0)
      label = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    } else if (period === 'last-3-months') {
      start = new Date(now.getFullYear(), now.getMonth() - 3, 1)
      label = 'Last 3 Months'
    } else {
      start = new Date(now.getFullYear(), 0, 1)
      label = `Year ${now.getFullYear()}`
    }
    return {
      rangeTx: transactions.filter(t => { const d = new Date(t.date); return d >= start && d <= end }),
      rangeIncome: incomes.filter(i => { const d = new Date(i.date); return d >= start && d <= end }).reduce((a, b) => a + b.amount, 0),
      label,
    }
  }, [transactions, incomes, period])

  const analysis = useMemo(() => analyzeSpending(rangeTx), [rangeTx])
  const tips = useMemo(() => generateSavingTips(analysis, budgets, rangeTx), [analysis, budgets, rangeTx])

  const categoryChart = useMemo(() => {
    return Object.entries(analysis.byCategory)
      .map(([id, value]) => ({ name: getCategory(id).label, value: Math.round(value), color: getCategory(id).color }))
      .sort((a, b) => b.value - a.value)
  }, [analysis])

  const netFlow = rangeIncome - analysis.total
  const savingsRate = rangeIncome > 0 ? (netFlow / rangeIncome) * 100 : 0

  const downloadReport = () => {
    const lines = [
      `SpendoraAI Report — ${label}`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      `Total Income: ${formatCurrency(rangeIncome, currency)}`,
      `Total Expenses: ${formatCurrency(analysis.total, currency)}`,
      `Net Savings: ${formatCurrency(netFlow, currency)}`,
      `Savings Rate: ${savingsRate.toFixed(1)}%`,
      '',
      'Spending by Category:',
      ...categoryChart.map(c => `  ${c.name}: ${formatCurrency(c.value, currency)}`),
      '',
      'AI Insights:',
      ...tips.map(t => `  - ${t.title}: ${t.detail}`),
      '',
      `Transaction Count: ${rangeTx.length}`,
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spendoraai-report-${period}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText size={24} className="text-brand-600" /> Reports
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Detailed financial summary — {label}</p>
        </div>
        <div className="flex gap-2">
          <select className="input sm:w-48" value={period} onChange={e => setPeriod(e.target.value)}>
            {PERIODS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <button onClick={downloadReport} className="btn-primary text-sm">
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5 animate-fadeInUp">
          <p className="text-sm text-slate-500 dark:text-slate-400">Income</p>
          <p className="text-xl font-bold mt-1 text-mint-600">{formatCurrency(rangeIncome, currency)}</p>
        </div>
        <div className="card p-5 animate-fadeInUp" style={{ animationDelay: '50ms' }}>
          <p className="text-sm text-slate-500 dark:text-slate-400">Expenses</p>
          <p className="text-xl font-bold mt-1 text-rose-500">{formatCurrency(analysis.total, currency)}</p>
        </div>
        <div className="card p-5 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <p className="text-sm text-slate-500 dark:text-slate-400">Net Flow</p>
          <p className={`text-xl font-bold mt-1 flex items-center gap-1 ${netFlow >= 0 ? 'text-brand-600' : 'text-rose-500'}`}>
            {netFlow >= 0 ? <TrendingUp size={17} /> : <TrendingDown size={17} />} {formatCurrency(netFlow, currency)}
          </p>
        </div>
        <div className="card p-5 animate-fadeInUp" style={{ animationDelay: '150ms' }}>
          <p className="text-sm text-slate-500 dark:text-slate-400">Savings Rate</p>
          <p className="text-xl font-bold mt-1 text-slate-900 dark:text-white">{savingsRate.toFixed(1)}%</p>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Category Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryChart} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} width={110} />
            <Tooltip formatter={v => formatCurrency(v, currency)} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {categoryChart.map((c, i) => <rect key={i} fill={c.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Summary & AI Insights</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tips.map((t, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{t.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.detail}</p>
              {t.impact > 0 && <p className="text-xs font-semibold text-mint-600 mt-2">Potential savings: {formatCurrency(t.impact, currency)}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><Calendar size={16} /> Report Details</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-400 text-xs">Transactions</p>
            <p className="font-semibold text-slate-800 dark:text-white">{rangeTx.length}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Top Category</p>
            <p className="font-semibold text-slate-800 dark:text-white">{analysis.topCategory ? getCategory(analysis.topCategory).label : '—'}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Avg Transaction</p>
            <p className="font-semibold text-slate-800 dark:text-white">{formatCurrency(rangeTx.length ? analysis.total / rangeTx.length : 0, currency)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Categories Used</p>
            <p className="font-semibold text-slate-800 dark:text-white">{Object.keys(analysis.byCategory).length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
