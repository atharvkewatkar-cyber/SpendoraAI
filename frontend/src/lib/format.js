// SpendoraAI uses Indian Rupees (INR) only.
export function formatCurrency(amount) {
  const isNeg = Number(amount) < 0
  const val = Math.abs(Number(amount) || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `₹${isNeg ? '-' : ''}${val}`
}

export function formatDate(dateStr, opts = {}) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', ...opts })
}

export function formatDateShort(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function timeAgo(dateStr) {
  const d = new Date(dateStr)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`
  return formatDateShort(dateStr)
}
