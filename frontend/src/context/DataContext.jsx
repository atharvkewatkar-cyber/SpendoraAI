import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { generateDemoTransactions, DEMO_BUDGETS, DEMO_GOALS } from '../lib/demoData'
import { categorizeExpense } from '../lib/ai'

const DataContext = createContext(null)
function storageKey(userId) { return `kharcova-data-v1-${userId || 'guest'}` }

function loadInitial(userId) {
  const STORAGE_KEY = storageKey(userId)
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) { /* ignore */ }
  const { transactions, incomes } = generateDemoTransactions(90)
  return { transactions, incomes, budgets: DEMO_BUDGETS, goals: DEMO_GOALS }
}

export function DataProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id || 'guest'
  const [state, setState] = useState(() => loadInitial(userId))
  const [currency, setCurrency] = useState('INR')
  const [userName, setUserName] = useState(() => user?.name || localStorage.getItem(`spendoraai-username-${userId}`) || 'Alex Morgan')
  const [notifications, setNotifications] = useState(() => {
    const s = localStorage.getItem(`spendoraai-notifications-${userId}`)
    return s ? JSON.parse(s) : { budgetAlerts: true, weeklySummary: true, anomalyAlerts: true }
  })

  useEffect(() => {
    setState(loadInitial(userId))
    setUserName(user?.name || localStorage.getItem(`spendoraai-username-${userId}`) || 'Alex Morgan')
    const savedNotifications = localStorage.getItem(`spendoraai-notifications-${userId}`)
    setNotifications(savedNotifications ? JSON.parse(savedNotifications) : { budgetAlerts: true, weeklySummary: true, anomalyAlerts: true })
  }, [userId])

  useEffect(() => {
    localStorage.setItem(storageKey(userId), JSON.stringify(state))
  }, [state, userId])
  useEffect(() => localStorage.setItem('spendoraai-currency', 'INR'), [])
  useEffect(() => localStorage.setItem(`spendoraai-username-${userId}`, userName), [userName, userId])
  useEffect(() => localStorage.setItem(`spendoraai-notifications-${userId}`, JSON.stringify(notifications)), [notifications, userId])

  const addTransaction = useCallback((tx) => {
    const category = tx.category || categorizeExpense(tx.merchant, tx.note)
    const newTx = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      date: tx.date || new Date().toISOString(),
      merchant: tx.merchant,
      amount: parseFloat(tx.amount),
      category,
      note: tx.note || '',
      type: 'expense',
      paymentMethod: tx.paymentMethod || 'Credit Card',
    }
    setState(s => ({ ...s, transactions: [newTx, ...s.transactions] }))
    return newTx
  }, [])

  const deleteTransaction = useCallback((id) => {
    setState(s => ({ ...s, transactions: s.transactions.filter(t => t.id !== id) }))
  }, [])

  const updateTransaction = useCallback((id, updates) => {
    setState(s => ({
      ...s,
      transactions: s.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
    }))
  }, [])

  const addIncome = useCallback((inc) => {
    const newInc = {
      id: `inc-${Date.now()}`,
      date: inc.date || new Date().toISOString(),
      source: inc.source,
      amount: parseFloat(inc.amount),
      type: 'income',
    }
    setState(s => ({ ...s, incomes: [newInc, ...s.incomes] }))
    return newInc
  }, [])

  const updateBudget = useCallback((category, limit) => {
    setState(s => {
      const exists = s.budgets.find(b => b.category === category)
      if (exists) {
        return { ...s, budgets: s.budgets.map(b => b.category === category ? { ...b, limit } : b) }
      }
      return { ...s, budgets: [...s.budgets, { id: `b-${Date.now()}`, category, limit, period: 'monthly' }] }
    })
  }, [])

  const deleteBudget = useCallback((id) => {
    setState(s => ({ ...s, budgets: s.budgets.filter(b => b.id !== id) }))
  }, [])

  const addGoal = useCallback((goal) => {
    const newGoal = {
      id: `g-${Date.now()}`,
      name: goal.name,
      target: parseFloat(goal.target),
      saved: parseFloat(goal.saved || 0),
      deadline: goal.deadline,
      icon: goal.icon || 'Target',
      color: goal.color || '#3b82f6',
    }
    setState(s => ({ ...s, goals: [...s.goals, newGoal] }))
    return newGoal
  }, [])

  const updateGoal = useCallback((id, updates) => {
    setState(s => ({ ...s, goals: s.goals.map(g => g.id === id ? { ...g, ...updates } : g) }))
  }, [])

  const deleteGoal = useCallback((id) => {
    setState(s => ({ ...s, goals: s.goals.filter(g => g.id !== id) }))
  }, [])

  const contributeToGoal = useCallback((id, amount) => {
    setState(s => ({
      ...s,
      goals: s.goals.map(g => g.id === id ? { ...g, saved: Math.min(g.target, g.saved + parseFloat(amount)) } : g)
    }))
  }, [])

  const resetDemoData = useCallback(() => {
    const { transactions, incomes } = generateDemoTransactions(90)
    setState({ transactions, incomes, budgets: DEMO_BUDGETS, goals: DEMO_GOALS })
  }, [])

  const clearAllData = useCallback(() => {
    setState({ transactions: [], incomes: [], budgets: [], goals: [] })
  }, [])

  // Derived: current month totals
  const derived = useMemo(() => {
    const now = new Date()
    const thisMonthTx = state.transactions.filter(t => {
      const d = new Date(t.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const thisMonthIncome = state.incomes.filter(i => {
      const d = new Date(i.date)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const totalExpense = thisMonthTx.reduce((a, b) => a + b.amount, 0)
    const totalIncome = thisMonthIncome.reduce((a, b) => a + b.amount, 0)
    const totalBudget = state.budgets.reduce((a, b) => a + b.limit, 0)
    const savings = totalIncome - totalExpense

    return {
      thisMonthTx,
      totalExpense,
      totalIncome,
      totalBudget,
      budgetLeft: totalBudget - totalExpense,
      savings,
      savingsRate: totalIncome > 0 ? (savings / totalIncome) * 100 : 0,
    }
  }, [state.transactions, state.incomes, state.budgets])

  const value = {
    ...state,
    ...derived,
    currency: 'INR', setCurrency: () => {},
    userName, setUserName,
    notifications, setNotifications,
    addTransaction, deleteTransaction, updateTransaction,
    addIncome,
    updateBudget, deleteBudget,
    addGoal, updateGoal, deleteGoal, contributeToGoal,
    resetDemoData, clearAllData,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useData = () => useContext(DataContext)
