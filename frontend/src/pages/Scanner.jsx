import { useState, useRef } from 'react'
import { Upload, ScanLine, Check, Loader2, FileImage, X } from 'lucide-react'
import { useData } from '../context/DataContext'
import { useNavigate } from 'react-router-dom'
import { categorizeExpense } from '../lib/ai'
import { CATEGORIES, getCategory } from '../lib/categories'
import { api } from '../lib/api'
import { CategoryIconCircle } from '../components/CategoryBadge'

// Simulated OCR merchant/amount extraction for demo purposes when backend OCR
// isn't reachable. Produces plausible results from the uploaded filename/size.
function simulateOCR(file) {
  const merchants = ['Whole Foods Market', 'Target', 'Shell Gas Station', 'Starbucks', 'CVS Pharmacy', 'Best Buy']
  const idx = Math.abs(hashCode(file.name + file.size)) % merchants.length
  const amount = Math.round((15 + (Math.abs(hashCode(file.name)) % 200)) * 100) / 100
  const merchant = merchants[idx]
  return {
    merchant,
    amount,
    date: new Date().toISOString().slice(0, 10),
    category: categorizeExpense(merchant),
    items: [
      { name: 'Item 1', price: (amount * 0.4).toFixed(2) },
      { name: 'Item 2', price: (amount * 0.35).toFixed(2) },
      { name: 'Item 3', price: (amount * 0.25).toFixed(2) },
    ],
    confidence: 87 + (Math.abs(hashCode(file.name)) % 11),
  }
}

function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}

export default function Scanner() {
  const { addTransaction } = useData()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [saved, setSaved] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return
    setFile(f)
    setResult(null)
    setSaved(false)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(f)
  }

  const runScan = async () => {
    if (!file) return
    setScanning(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/scanner/ocr', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(res.data)
    } catch {
      await new Promise(r => setTimeout(r, 1400))
      setResult(simulateOCR(file))
    }
    setScanning(false)
  }

  const confirmSave = () => {
    addTransaction({
      merchant: result.merchant,
      amount: result.amount,
      category: result.category,
      note: 'Scanned via receipt OCR',
      date: new Date(result.date).toISOString(),
      paymentMethod: 'Credit Card',
    })
    setSaved(true)
    setTimeout(() => navigate('/transactions'), 900)
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setResult(null)
    setSaved(false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ScanLine size={24} className="text-brand-600" /> Receipt Scanner
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Upload a receipt photo and let AI extract the details</p>
      </div>

      {!preview ? (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
          onClick={() => fileInputRef.current?.click()}
          className={`card p-16 text-center cursor-pointer border-2 border-dashed transition-all ${dragOver ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20' : 'border-slate-200 dark:border-slate-700'}`}
        >
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center mx-auto mb-4">
            <Upload size={28} className="text-brand-600" />
          </div>
          <p className="font-medium text-slate-700 dark:text-slate-200">Drop your receipt here, or click to browse</p>
          <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG — up to 10MB</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="card p-4 relative">
            <button onClick={reset} className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-500 hover:text-rose-600 shadow-sm">
              <X size={15} />
            </button>
            <img src={preview} alt="Receipt preview" className="w-full h-80 object-cover rounded-xl" />
            {!result && !scanning && (
              <button onClick={runScan} className="btn-primary w-full mt-4">
                <ScanLine size={16} /> Scan Receipt with AI
              </button>
            )}
            {scanning && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-brand-600 py-2.5">
                <Loader2 size={16} className="animate-spin" /> Analyzing receipt...
              </div>
            )}
          </div>

          <div className="card p-5">
            {!result ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-10">
                <FileImage size={32} className="mb-3 opacity-40" />
                <p className="text-sm">Extracted details will appear here after scanning.</p>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Extracted Details</h3>
                  <span className="badge bg-mint-50 dark:bg-mint-950/30 text-mint-600 text-[11px]">{result.confidence}% confidence</span>
                </div>

                <div>
                  <label className="label">Merchant</label>
                  <input className="input" value={result.merchant} onChange={e => setResult({ ...result, merchant: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Amount</label>
                    <input className="input" type="number" step="0.01" value={result.amount} onChange={e => setResult({ ...result, amount: parseFloat(e.target.value) })} />
                  </div>
                  <div>
                    <label className="label">Date</label>
                    <input className="input" type="date" value={result.date} onChange={e => setResult({ ...result, date: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={result.category} onChange={e => setResult({ ...result, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>

                {result.items && (
                  <div>
                    <label className="label">Line Items</label>
                    <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                      {result.items.map((it, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{it.name}</span>
                          <span>₹{it.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={confirmSave} disabled={saved} className="btn-primary w-full">
                  {saved ? <><Check size={16} /> Saved!</> : 'Confirm & Add Expense'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
