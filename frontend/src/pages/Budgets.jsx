import { useMemo, useState } from 'react'
import { Sparkles, Plus, Pencil, Trash2, Check, AlertTriangle } from 'lucide-react'
import { useData } from '../context/DataContext'
import { CATEGORIES, getCategory } from '../lib/categories'
import { formatCurrency } from '../lib/format'
import { analyzeSpending, suggestBudgets } from '../lib/ai'
import { CategoryIconCircle } from '../components/CategoryBadge'
import Modal from '../components/Modal'

export default function Budgets() {
  const { thisMonthTx, budgets, totalIncome, updateBudget, deleteBudget, currency } = useData()
  const [addOpen, setAddOpen] = useState(false)
  const [editBudget, setEditBudget] = useState(null)
  const [suggestOpen, setSuggestOpen] = useState(false)

  const analysis = useMemo(() => analyzeSpending(thisMonthTx), [thisMonthTx])
  const suggestions = useMemo(() => suggestBudgets(analysis.byCategory, totalIncome), [analysis, totalIncome])

  const totalBudget = budgets.reduce((a, b) => a + b.limit, 0)
  const totalSpent = budgets.reduce((a, b) => a + (analysis.byCategory[b.category] || 0), 0)

  const applyAllSuggestions = () => {
    Object.entries(suggestions).forEach(([cat, limit]) => updateBudget(cat, limit))
    setSuggestOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Budgets</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track and manage your monthly spending limits</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setSuggestOpen(true)} className="btn-secondary text-sm">
            <Sparkles size={15} /> AI Suggest
          </button>
          <button onClick={() => setAddOpen(true)} className="btn-primary text-sm">
            <Plus size={15} /> New Budget
          </button>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Overall Budget Usage</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(totalSpent, currency)} / {formatCurrency(totalBudget, currency)}</p>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${totalSpent / totalBudget > 0.9 ? 'bg-rose-500' : totalSpent / totalBudget > 0.7 ? 'bg-amber-500' : 'bg-mint-500'}`}
            style={{ width: `${Math.min(100, (totalSpent / totalBudget) * 100 || 0)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((b, i) => {
          const spent = analysis.byCategory[b.category] || 0
          const pct = Math.min(100, (spent / b.limit) * 100)
          const cat = getCategory(b.category)
          const isOver = spent > b.limit
          const isWarning = pct > 80 && !isOver

          return (
            <div key={b.id} className="card p-5 card-hover animate-fadeInUp" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <CategoryIconCircle categoryId={b.category} size={40} />
                  <div>
                    <p className="font-medium text-sm text-slate-800 dark:text-slate-100">{cat.label}</p>
                    <p className="text-xs text-slate-400">Monthly</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditBudget(b)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteBudget(b.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(spent, currency)}</span>
                <span className="text-xs text-slate-400">of {formatCurrency(b.limit, currency)}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-mint-500'}`}
                  style={{ width: `${pct}%`, backgroundColor: !isOver && !isWarning ? cat.color : undefined }}
                />
              </div>
              {isOver && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1 font-medium">
                  <AlertTriangle size={12} /> {formatCurrency(spent - b.limit, currency)} over budget
                </p>
              )}
              {isWarning && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-medium">{Math.round(pct)}% used — approaching limit</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Add / Edit Budget */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Create New Budget" maxWidth="max-w-sm">
        <BudgetForm
          existingCategories={budgets.map(b => b.category)}
          onSave={(cat, limit) => { updateBudget(cat, limit); setAddOpen(false) }}
          onClose={() => setAddOpen(false)}
        />
      </Modal>

      <Modal open={!!editBudget} onClose={() => setEditBudget(null)} title="Edit Budget" maxWidth="max-w-sm">
        {editBudget && (
          <EditBudgetForm
            budget={editBudget}
            onSave={(limit) => { updateBudget(editBudget.category, limit); setEditBudget(null) }}
            onClose={() => setEditBudget(null)}
          />
        )}
      </Modal>

      {/* AI Suggestions */}
      <Modal open={suggestOpen} onClose={() => setSuggestOpen(false)} title="AI Budget Suggestions">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Based on your last 90 days of spending, here are AI-recommended budget limits:</p>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {Object.entries(suggestions).map(([cat, limit]) => (
            <div key={cat} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <CategoryIconCircle categoryId={cat} size={32} />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{getCategory(cat).label}</span>
              </div>
              <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">{formatCurrency(limit, currency)}/mo</span>
            </div>
          ))}
        </div>
        <button onClick={applyAllSuggestions} className="btn-primary w-full mt-5">
          <Check size={15} /> Apply All Suggestions
        </button>
      </Modal>
    </div>
  )
}

function BudgetForm({ existingCategories, onSave, onClose }) {
  const available = CATEGORIES.filter(c => !existingCategories.includes(c.id))
  const [cat, setCat] = useState(available[0]?.id || '')
  const [limit, setLimit] = useState('')

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(cat, parseFloat(limit)) }} className="space-y-4">
      <div>
        <label className="label">Category</label>
        <select className="input" value={cat} onChange={e => setCat(e.target.value)} required>
          {available.length === 0 && <option value="">All categories already budgeted</option>}
          {available.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Monthly Limit</label>
        <input className="input" type="number" min="1" step="1" value={limit} onChange={e => setLimit(e.target.value)} required placeholder="e.g. 300" />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" disabled={!cat} className="btn-primary flex-1">Create Budget</button>
      </div>
    </form>
  )
}

function EditBudgetForm({ budget, onSave, onClose }) {
  const [limit, setLimit] = useState(budget.limit)
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(parseFloat(limit)) }} className="space-y-4">
      <div>
        <label className="label">{getCategory(budget.category).label} — Monthly Limit</label>
        <input className="input" type="number" min="1" step="1" value={limit} onChange={e => setLimit(e.target.value)} required />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" className="btn-primary flex-1"><Check size={15}/> Save</button>
      </div>
    </form>
  )
}
