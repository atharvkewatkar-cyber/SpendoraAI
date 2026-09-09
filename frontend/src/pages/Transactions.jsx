import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, Trash2, Pencil, X, Check, Download } from 'lucide-react'
import { useData } from '../context/DataContext'
import { CATEGORIES, getCategory } from '../lib/categories'
import { CategoryIconCircle } from '../components/CategoryBadge'
import { formatCurrency, formatDate } from '../lib/format'
import Modal from '../components/Modal'

export default function Transactions() {
  const { transactions, deleteTransaction, updateTransaction, currency } = useData()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')
  const [editTx, setEditTx] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const filtered = useMemo(() => {
    let list = transactions.filter(t => {
      const matchesQuery = !query || t.merchant.toLowerCase().includes(query.toLowerCase()) || (t.note || '').toLowerCase().includes(query.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter
      return matchesQuery && matchesCategory
    })
    list.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date)
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date)
      if (sortBy === 'amount-desc') return b.amount - a.amount
      if (sortBy === 'amount-asc') return a.amount - b.amount
      return 0
    })
    return list
  }, [transactions, query, categoryFilter, sortBy])

  const total = filtered.reduce((a, b) => a + b.amount, 0)

  const exportCSV = () => {
    const headers = ['Date', 'Merchant', 'Category', 'Amount', 'Payment Method', 'Note']
    const rows = filtered.map(t => [formatDate(t.date), t.merchant, getCategory(t.category).label, t.amount, t.paymentMethod, t.note || ''])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spendoraai-transactions-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{filtered.length} transactions · {formatCurrency(total, currency)} total</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary text-sm">
          <Download size={15} /> Export CSV
        </button>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Search merchant or note..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <select className="input sm:w-52" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select className="input sm:w-48" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Highest Amount</option>
          <option value="amount-asc">Lowest Amount</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Filter size={32} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No transactions match your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((t, i) => (
              <div key={t.id} className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group animate-fadeIn" style={{ animationDelay: `${Math.min(i * 20, 300)}ms` }}>
                <CategoryIconCircle categoryId={t.category} size={42} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{t.merchant}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    {formatDate(t.date)} · {t.paymentMethod}
                    {t.note && <span className="truncate">· {t.note}</span>}
                  </p>
                </div>
                <span className="hidden sm:inline-block text-[11px] px-2 py-1 rounded-full font-medium" style={{ backgroundColor: `${getCategory(t.category).color}1a`, color: getCategory(t.category).color }}>
                  {getCategory(t.category).label}
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white w-20 text-right shrink-0">-{formatCurrency(t.amount, currency)}</p>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => setEditTx(t)} className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setDeleteConfirm(t)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EditModal tx={editTx} onClose={() => setEditTx(null)} onSave={(updates) => { updateTransaction(editTx.id, updates); setEditTx(null) }} />

      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Transaction" maxWidth="max-w-sm">
        {deleteConfirm && (
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Delete <strong>{deleteConfirm.merchant}</strong> for {formatCurrency(deleteConfirm.amount, currency)}? This cannot be undone.
            </p>
            <div className="flex gap-2 mt-5">
              <button className="btn-secondary flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button
                className="flex-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium py-2.5 transition-colors"
                onClick={() => { deleteTransaction(deleteConfirm.id); setDeleteConfirm(null) }}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function EditModal({ tx, onClose, onSave }) {
  const [merchant, setMerchant] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')

  useState(() => {}, [])

  if (tx && merchant === '' && tx.merchant !== merchant && amount === '') {
    // initialize once when tx changes
  }

  return (
    <Modal open={!!tx} onClose={onClose} title="Edit Transaction">
      {tx && <EditForm tx={tx} onSave={onSave} onClose={onClose} />}
    </Modal>
  )
}

function EditForm({ tx, onSave, onClose }) {
  const [merchant, setMerchant] = useState(tx.merchant)
  const [amount, setAmount] = useState(tx.amount)
  const [category, setCategory] = useState(tx.category)
  const [note, setNote] = useState(tx.note || '')

  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ merchant, amount: parseFloat(amount), category, note }) }} className="space-y-4">
      <div>
        <label className="label">Merchant</label>
        <input className="input" value={merchant} onChange={e => setMerchant(e.target.value)} required />
      </div>
      <div>
        <label className="label">Amount</label>
        <input className="input" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
      </div>
      <div>
        <label className="label">Category</label>
        <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Note</label>
        <input className="input" value={note} onChange={e => setNote(e.target.value)} />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
        <button type="submit" className="btn-primary flex-1"><Check size={15} /> Save Changes</button>
      </div>
    </form>
  )
}
