import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-scaleIn max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-white dark:bg-slate-900 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 rounded-t-2xl">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
