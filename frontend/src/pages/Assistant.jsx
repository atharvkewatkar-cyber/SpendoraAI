import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Bot, User } from 'lucide-react'
import { useData } from '../context/DataContext'
import { answerChatQuery } from '../lib/ai'
import { api } from '../lib/api'

const SUGGESTED = [
  'How much did I spend this month?',
  "What's my top spending category?",
  'Am I over budget anywhere?',
  'Predict my spending next month',
  'Any unusual transactions?',
  'How are my savings goals doing?',
]

export default function Assistant() {
  const { thisMonthTx, budgets, goals, totalIncome } = useData()
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your AI expense assistant. I can help you understand your spending, check budgets, and plan ahead. What would you like to know?" }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const send = async (text) => {
    const query = text || input
    if (!query.trim()) return
    setMessages(m => [...m, { role: 'user', text: query }])
    setInput('')
    setTyping(true)

    let reply
    try {
      const res = await api.post('/assistant/chat', { message: query })
      reply = res.data.reply
    } catch {
      reply = answerChatQuery(query, { transactions: thisMonthTx, budgets, goals, income: totalIncome })
    }

    setTimeout(() => {
      setMessages(m => [...m, { role: 'assistant', text: reply }])
      setTyping(false)
    }, 550)
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bot size={24} className="text-brand-600" /> AI Assistant
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Ask anything about your finances</p>
      </div>

      <div className="flex-1 card p-4 sm:p-6 overflow-y-auto space-y-4 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 animate-fadeInUp ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-gradient-to-br from-brand-500 to-mint-500'}`}>
              {m.role === 'user' ? <User size={15} className="text-slate-600 dark:text-slate-300" /> : <Sparkles size={15} className="text-white" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-brand-600 text-white rounded-tr-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-brand-500 to-mint-500">
              <Sparkles size={15} className="text-white" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulseSoft" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulseSoft" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulseSoft" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTED.map(s => (
            <button key={s} onClick={() => send(s)} className="text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-600 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={e => { e.preventDefault(); send() }} className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Ask about your spending..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button type="submit" className="btn-primary px-4" disabled={!input.trim()}>
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
