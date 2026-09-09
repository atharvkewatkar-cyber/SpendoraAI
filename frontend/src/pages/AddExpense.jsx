import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Check, DollarSign, Store, Calendar, CreditCard, FileText } from 'lucide-react'
import { useData } from '../context/DataContext'
import { CATEGORIES, getCategory } from '../lib/categories'
import { categorizeExpense } from '../lib/ai'
import DynamicIcon from '../components/DynamicIcon'

const PAYMENT_METHODS = ['Credit Card', 'Debit Card', 'Cash', 'UPI', 'Bank Transfer']

export default function AddExpense() {
  const { addTransaction } = useData()
  const navigate = useNavigate()

  const [merchant, setMerchant] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [paymentMethod, setPaymentMethod] = useState('Credit Card')
  const [aiSuggested, setAiSuggested] = useState(null)
  const [manualOverride, setManualOverride] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (merchant.trim().length > 1 && !manualOverride) {
      const suggested = categorizeExpense(merchant, note)
      setAiSuggested(suggested)
      setCategory(suggested)
    }
  }, [merchant, note, manualOverride])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!merchant || !amount || parseFloat(amount) <= 0) return

    addTransaction({
      merchant,
      amount,
      category: category || 'other',
      note,
      date: new Date(date).toISOString(),
      paymentMethod,
    })

    setSuccess(true)
    setTimeout(() => {
      navigate('/transactions')
    }, 900)
  }

  const selectCategory = (id) => {
    setCategory(id)
    setManualOverride(true)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add Expense</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Log a new transaction — AI will auto-categorize it for you.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5 animate-fadeInUp">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label"><Store size={13} className="inline mr-1 -mt-0.5" /> Merchant / Payee</label>
            <input
              className="input"
              placeholder="e.g. Starbucks, Amazon..."
              value={merchant}
              onChange={e => setMerchant(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label"><DollarSign size={13} className="inline mr-1 -mt-0.5" /> Amount</label>
            <input
              className="input"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label"><Calendar size={13} className="inline mr-1 -mt-0.5" /> Date</label>
            <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div>
            <label className="label"><CreditCard size={13} className="inline mr-1 -mt-0.5" /> Payment Method</label>
            <select className="input" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label"><FileText size={13} className="inline mr-1 -mt-0.5" /> Note (optional)</label>
          <input className="input" placeholder="Add a note..." value={note} onChange={e => setNote(e.target.value)} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">Category</label>
            {aiSuggested && category === aiSuggested && (
              <span className="badge bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
                <Sparkles size={11} /> AI Suggested
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {CATEGORIES.map(c => (
              <button
                type="button"
                key={c.id}
                onClick={() => selectCategory(c.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-150 active:scale-95 ${
                  category === c.id
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${c.color}1a`, color: c.color }}>
                  <DynamicIcon name={c.icon} size={16} />
                </div>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 text-center leading-tight">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={success} className="btn-primary w-full py-3 text-sm">
          {success ? <><Check size={16} /> Expense Added!</> : <>Save Expense</>}
        </button>
      </form>
    </div>
  )
}
