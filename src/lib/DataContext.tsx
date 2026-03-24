'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import {
  Account,
  FixedDeposit,
  Transaction,
  MFHoldingRaw,
  MFHoldingComputed,
  ShareHoldingRaw,
  ShareHoldingComputed,
  MFTotals,
  ShareTotals,
  LTCG,
  AppSettings,
  MonthlyDataItem,
  AssetAllocationItem,
  EntityNetWorth,
  DataContextType,
} from './types'

const DataContext = createContext<DataContextType | null>(null)

// Demo monthly data used when no real data exists
const DEMO_MONTHLY_DATA: MonthlyDataItem[] = [
  { name: 'Apr', income: 280000, expense: 68000 },
  { name: 'May', income: 310000, expense: 72000 },
  { name: 'Jun', income: 295000, expense: 65000 },
  { name: 'Jul', income: 315000, expense: 74000 },
  { name: 'Aug', income: 340000, expense: 80000 },
  { name: 'Sep', income: 298000, expense: 69000 },
  { name: 'Oct', income: 360000, expense: 85000 },
  { name: 'Nov', income: 305000, expense: 73000 },
  { name: 'Dec', income: 320000, expense: 76000 },
  { name: 'Jan', income: 330000, expense: 80000 },
  { name: 'Feb', income: 288000, expense: 70000 },
  { name: 'Mar', income: 299000, expense: 70000 },
]

// Initial state
const getInitialState = () => ({
  accounts: [] as Account[],
  fds: [] as FixedDeposit[],
  transactions: [] as Transaction[],
  mfHoldings: [] as MFHoldingComputed[],
  shareHoldings: [] as ShareHoldingComputed[],
  mfTotals: { totalInvested: 0, totalCurrentValue: 0, totalGain: 0, totalReturn: 0 } as MFTotals,
  shareTotals: { totalInvested: 0, totalCurrentValue: 0, totalGain: 0, totalDividend: 0 } as ShareTotals,
  totalBankBalance: 0,
  netWorth: 0,
  totalInvestments: 0,
  entityNetWorth: { personal: 0, huf: 0, firm: 0 } as EntityNetWorth,
  ltcg: { booked: 0, limit: 125000 },
  monthlyData: DEMO_MONTHLY_DATA,
  assetAllocation: [] as AssetAllocationItem[],
  loading: true,
  error: null as string | null,
})

// Compute MF holdings with derived values
function computeMFHoldings(raw: MFHoldingRaw[]): MFHoldingComputed[] {
  return raw.map(h => {
    const invested = Math.round(h.units * h.avgNAV)
    const currentValue = Math.round(h.units * h.currentNAV)
    const gain = currentValue - invested
    const gainPct = invested > 0 ? (gain / invested) * 100 : 0
    const change1D = 0 // Would need previous day NAV to calculate
    return { ...h, invested, currentValue, gain, gainPct, change1D }
  })
}

// Compute Share holdings with derived values
function computeShareHoldings(raw: ShareHoldingRaw[]): ShareHoldingComputed[] {
  return raw.map(h => {
    const invested = Math.round(h.qty * h.avgPrice)
    const currentValue = Math.round(h.qty * h.cmp)
    const gain = currentValue - invested
    const gainPct = invested > 0 ? (gain / invested) * 100 : 0
    return { ...h, invested, currentValue, gain, gainPct }
  })
}

// Compute MF totals
function computeMFTotals(holdings: MFHoldingComputed[]): MFTotals {
  const totalInvested = holdings.reduce((sum, h) => sum + h.invested, 0)
  const totalCurrentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)
  const totalGain = holdings.reduce((sum, h) => sum + h.gain, 0)
  const totalReturn = totalInvested > 0 ? Number(((totalGain / totalInvested) * 100).toFixed(1)) : 0
  return { totalInvested, totalCurrentValue, totalGain, totalReturn }
}

// Compute Share totals
function computeShareTotals(holdings: ShareHoldingComputed[]): ShareTotals {
  const totalInvested = holdings.reduce((sum, h) => sum + h.invested, 0)
  const totalCurrentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)
  const totalGain = holdings.reduce((sum, h) => sum + h.gain, 0)
  const totalDividend = holdings.reduce((sum, h) => sum + h.dividendFY, 0)
  return { totalInvested, totalCurrentValue, totalGain, totalDividend }
}

// Compute monthly data from transactions
function computeMonthlyData(transactions: Transaction[]): MonthlyDataItem[] {
  const monthNames = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'] as const
  const monthlyMap: Record<string, { income: number; expense: number }> = {}
  monthNames.forEach(m => { monthlyMap[m] = { income: 0, expense: 0 } })

  transactions.forEach(t => {
    const dateStr = t.date || ''
    const monthMatch = dateStr.match(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/)
    if (monthMatch) {
      const m = monthMatch[0]
      if (monthlyMap[m]) {
        if (t.credit > 0 && !t.isTransfer) monthlyMap[m].income += t.credit
        if (t.debit > 0 && !t.isTransfer) monthlyMap[m].expense += t.debit
      }
    }
  })

  const hasRealData = transactions.length > 0
  return hasRealData
    ? monthNames.map(name => ({ name, income: monthlyMap[name].income, expense: monthlyMap[name].expense }))
    : DEMO_MONTHLY_DATA
}

// Compute asset allocation
function computeAssetAllocation(
  mfTotals: MFTotals,
  shareTotals: ShareTotals,
  totalFDs: number,
  totalBankBalance: number
): AssetAllocationItem[] {
  const totalAssets = mfTotals.totalCurrentValue + shareTotals.totalCurrentValue + totalFDs + totalBankBalance

  if (totalAssets === 0) return []

  return [
    { name: 'Equity MF', value: Math.round((mfTotals.totalCurrentValue / totalAssets) * 100), color: 'var(--personal)', amount: mfTotals.totalCurrentValue },
    { name: 'Direct Equity', value: Math.round((shareTotals.totalCurrentValue / totalAssets) * 100), color: 'var(--huf)', amount: shareTotals.totalCurrentValue },
    { name: 'Fixed Deposits', value: Math.round((totalFDs / totalAssets) * 100), color: 'var(--gold)', amount: totalFDs },
    { name: 'Savings', value: Math.round((totalBankBalance / totalAssets) * 100), color: 'var(--firm)', amount: totalBankBalance },
  ].filter(a => a.amount > 0)
}

// Compute entity net worth
function computeEntityNetWorth(
  accounts: Account[],
  fds: FixedDeposit[],
  mfHoldings: MFHoldingComputed[],
  shareHoldings: ShareHoldingComputed[]
): EntityNetWorth {
  const entityNetWorth: EntityNetWorth = { personal: 0, huf: 0, firm: 0 }

  accounts.forEach(a => {
    const entity = a.entity as keyof EntityNetWorth
    if (entity in entityNetWorth && entity !== 'all') entityNetWorth[entity] += a.balance
  })

  fds.forEach(f => {
    const entity = f.entity as keyof EntityNetWorth
    if (entity in entityNetWorth && entity !== 'all') entityNetWorth[entity] += f.principal
  })

  mfHoldings.forEach(h => {
    const entity = h.entity as keyof EntityNetWorth
    if (entity in entityNetWorth && entity !== 'all') entityNetWorth[entity] += h.currentValue
  })

  shareHoldings.forEach(h => {
    const entity = h.entity as keyof EntityNetWorth
    if (entity in entityNetWorth && entity !== 'all') entityNetWorth[entity] += h.currentValue
  })

  return entityNetWorth
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(getInitialState)
  const [selectedFY, setSelectedFY] = useState('FY 2025-26')
  
  // Use a ref to access current state in callbacks without causing re-renders
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Fetch all data from APIs
  const fetchAllData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      // Fetch all data in parallel
      const [accountsRes, fdsRes, transactionsRes, mfRes, shareRes, settingsRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/fds'),
        fetch('/api/transactions'),
        fetch('/api/mf-holdings'),
        fetch('/api/share-holdings'),
        fetch('/api/settings'),
      ])

      // Check for errors
      if (!accountsRes.ok) throw new Error('Failed to fetch accounts')
      if (!fdsRes.ok) throw new Error('Failed to fetch FDs')
      if (!transactionsRes.ok) throw new Error('Failed to fetch transactions')
      if (!mfRes.ok) throw new Error('Failed to fetch MF holdings')
      if (!shareRes.ok) throw new Error('Failed to fetch share holdings')

      // Parse JSON
      const accounts: Account[] = await accountsRes.json()
      const fds: FixedDeposit[] = await fdsRes.json()
      const transactions: Transaction[] = await transactionsRes.json()
      const mfRaw: MFHoldingRaw[] = await mfRes.json()
      const shareRaw: ShareHoldingRaw[] = await shareRes.json()
      const settings: AppSettings = await settingsRes.json()

      // Compute derived values
      const mfHoldings = computeMFHoldings(mfRaw)
      const shareHoldings = computeShareHoldings(shareRaw)
      const mfTotals = computeMFTotals(mfHoldings)
      const shareTotals = computeShareTotals(shareHoldings)
      const totalBankBalance = accounts.reduce((sum, a) => sum + a.balance, 0)
      const totalFDs = fds.reduce((sum, f) => sum + f.principal, 0)
      const monthlyData = computeMonthlyData(transactions)
      const assetAllocation = computeAssetAllocation(mfTotals, shareTotals, totalFDs, totalBankBalance)
      const entityNetWorth = computeEntityNetWorth(accounts, fds, mfHoldings, shareHoldings)
      const netWorth = mfTotals.totalCurrentValue + shareTotals.totalCurrentValue + totalFDs + totalBankBalance
      const totalInvestments = mfTotals.totalCurrentValue + shareTotals.totalCurrentValue + totalFDs

      // Parse LTCG from settings
      const ltcg: LTCG = {
        booked: parseInt(settings.ltcgBooked || '0', 10),
        limit: parseInt(settings.ltcgLimit || '125000', 10),
      }

      setState({
        accounts,
        fds,
        transactions,
        mfHoldings,
        shareHoldings,
        mfTotals,
        shareTotals,
        totalBankBalance,
        netWorth,
        totalInvestments,
        entityNetWorth,
        ltcg,
        monthlyData,
        assetAllocation,
        loading: false,
        error: null,
      })
    } catch (error) {
      console.error('Error fetching data:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data',
      }))
      toast.error('Failed to load data. Please refresh the page.')
    }
  }, [])

  // Initial load - with proper cleanup to prevent race conditions
  useEffect(() => {
    let isMounted = true
    
    const loadData = async () => {
      if (isMounted) {
        await fetchAllData()
      }
    }
    
    loadData()
    
    return () => {
      isMounted = false
    }
  }, [fetchAllData])

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await fetchAllData()
  }, [fetchAllData])

  // === Account Operations ===
  const addAccount = useCallback(async (data: Partial<Account>) => {
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to add account')
      await fetchAllData()
      toast.success('Account added successfully')
    } catch (error) {
      toast.error('Failed to add account')
      throw error
    }
  }, [fetchAllData])

  const updateAccount = useCallback(async (id: string, data: Partial<Account>) => {
    try {
      const res = await fetch('/api/accounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })
      if (!res.ok) throw new Error('Failed to update account')
      await fetchAllData()
      toast.success('Account updated successfully')
    } catch (error) {
      toast.error('Failed to update account')
      throw error
    }
  }, [fetchAllData])

  const deleteAccount = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/accounts?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete account')
      await fetchAllData()
      toast.success('Account deleted successfully')
    } catch (error) {
      toast.error('Failed to delete account')
      throw error
    }
  }, [fetchAllData])

  const updateAccountBalance = useCallback(async (id: string, balance: number) => {
    try {
      const res = await fetch('/api/accounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, balance }),
      })
      if (!res.ok) throw new Error('Failed to update account balance')
      await fetchAllData()
    } catch (error) {
      toast.error('Failed to update account balance')
      throw error
    }
  }, [fetchAllData])

  // === FD Operations ===
  const addFD = useCallback(async (data: Partial<FixedDeposit>) => {
    try {
      const res = await fetch('/api/fds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to add FD')
      await fetchAllData()
      toast.success('Fixed deposit added successfully')
    } catch (error) {
      toast.error('Failed to add fixed deposit')
      throw error
    }
  }, [fetchAllData])

  const updateFD = useCallback(async (id: string, data: Partial<FixedDeposit>) => {
    try {
      const res = await fetch('/api/fds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })
      if (!res.ok) throw new Error('Failed to update FD')
      await fetchAllData()
      toast.success('Fixed deposit updated successfully')
    } catch (error) {
      toast.error('Failed to update fixed deposit')
      throw error
    }
  }, [fetchAllData])

  const deleteFD = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/fds?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete FD')
      await fetchAllData()
      toast.success('Fixed deposit deleted successfully')
    } catch (error) {
      toast.error('Failed to delete fixed deposit')
      throw error
    }
  }, [fetchAllData])

  // === Transaction Operations ===
  const addTransaction = useCallback(async (data: Partial<Transaction>) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to add transaction')
      await fetchAllData()
      toast.success('Transaction added successfully')
    } catch (error) {
      toast.error('Failed to add transaction')
      throw error
    }
  }, [fetchAllData])

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete transaction')
      await fetchAllData()
      toast.success('Transaction deleted successfully')
    } catch (error) {
      toast.error('Failed to delete transaction')
      throw error
    }
  }, [fetchAllData])

  // === MF Holding Operations ===
  const addMFHolding = useCallback(async (data: Partial<MFHoldingRaw>) => {
    try {
      const res = await fetch('/api/mf-holdings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to add MF holding')
      await fetchAllData()
      toast.success('Mutual fund holding added successfully')
    } catch (error) {
      toast.error('Failed to add mutual fund holding')
      throw error
    }
  }, [fetchAllData])

  const updateMFHolding = useCallback(async (id: string, data: Partial<MFHoldingRaw>) => {
    try {
      const res = await fetch('/api/mf-holdings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })
      if (!res.ok) throw new Error('Failed to update MF holding')
      await fetchAllData()
      toast.success('Mutual fund holding updated successfully')
    } catch (error) {
      toast.error('Failed to update mutual fund holding')
      throw error
    }
  }, [fetchAllData])

  const deleteMFHolding = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/mf-holdings?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete MF holding')
      await fetchAllData()
      toast.success('Mutual fund holding deleted successfully')
    } catch (error) {
      toast.error('Failed to delete mutual fund holding')
      throw error
    }
  }, [fetchAllData])

  const updateMFNav = useCallback(async (id: string, nav: number) => {
    try {
      const res = await fetch('/api/mf-holdings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, currentNAV: nav }),
      })
      if (!res.ok) throw new Error('Failed to update NAV')
      await fetchAllData()
    } catch (error) {
      toast.error('Failed to update NAV')
      throw error
    }
  }, [fetchAllData])

  // === Share Holding Operations ===
  const addShareHolding = useCallback(async (data: Partial<ShareHoldingRaw>) => {
    try {
      const res = await fetch('/api/share-holdings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to add share holding')
      await fetchAllData()
      toast.success('Share holding added successfully')
    } catch (error) {
      toast.error('Failed to add share holding')
      throw error
    }
  }, [fetchAllData])

  const updateShareHolding = useCallback(async (id: string, data: Partial<ShareHoldingRaw>) => {
    try {
      const res = await fetch('/api/share-holdings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      })
      if (!res.ok) throw new Error('Failed to update share holding')
      await fetchAllData()
      toast.success('Share holding updated successfully')
    } catch (error) {
      toast.error('Failed to update share holding')
      throw error
    }
  }, [fetchAllData])

  const deleteShareHolding = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/share-holdings?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete share holding')
      await fetchAllData()
      toast.success('Share holding deleted successfully')
    } catch (error) {
      toast.error('Failed to delete share holding')
      throw error
    }
  }, [fetchAllData])

  const updateSharePrice = useCallback(async (id: string, cmp: number) => {
    try {
      const res = await fetch('/api/share-holdings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, cmp }),
      })
      if (!res.ok) throw new Error('Failed to update share price')
      await fetchAllData()
    } catch (error) {
      toast.error('Failed to update share price')
      throw error
    }
  }, [fetchAllData])

  // === Reset Operations ===
  const resetData = useCallback(async (type: 'all' | 'transactions' | 'mf' | 'shares') => {
    try {
      const currentState = stateRef.current
      
      if (type === 'all') {
        // Delete all data - call delete for each entity
        const deletePromises: Promise<void>[] = []
        
        currentState.accounts.forEach(a => deletePromises.push(deleteAccount(a.id)))
        currentState.fds.forEach(f => deletePromises.push(deleteFD(f.id)))
        currentState.transactions.forEach(t => deletePromises.push(deleteTransaction(t.id)))
        currentState.mfHoldings.forEach(m => deletePromises.push(deleteMFHolding(m.id)))
        currentState.shareHoldings.forEach(s => deletePromises.push(deleteShareHolding(s.id)))
        
        await Promise.all(deletePromises)
      } else if (type === 'transactions') {
        await Promise.all(stateRef.current.transactions.map(t => deleteTransaction(t.id)))
      } else if (type === 'mf') {
        await Promise.all(stateRef.current.mfHoldings.map(m => deleteMFHolding(m.id)))
      } else if (type === 'shares') {
        await Promise.all(stateRef.current.shareHoldings.map(s => deleteShareHolding(s.id)))
      }
      
      await fetchAllData()
      toast.success('Data reset successfully')
    } catch (error) {
      toast.error('Failed to reset data')
      throw error
    }
  }, [fetchAllData, deleteAccount, deleteFD, deleteTransaction, deleteMFHolding, deleteShareHolding])

  return (
    <DataContext.Provider
      value={{
        ...state,
        selectedFY,
        setSelectedFY,
        refreshAll,
        addAccount,
        updateAccount,
        deleteAccount,
        updateAccountBalance,
        addFD,
        updateFD,
        deleteFD,
        addTransaction,
        deleteTransaction,
        addMFHolding,
        updateMFHolding,
        deleteMFHolding,
        updateMFNav,
        addShareHolding,
        updateShareHolding,
        deleteShareHolding,
        updateSharePrice,
        resetData,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}

// Re-export types for components that need them
export type { 
  Account, 
  FixedDeposit, 
  Transaction, 
  MFHoldingRaw, 
  MFHoldingComputed, 
  ShareHoldingRaw, 
  ShareHoldingComputed 
} from './types'
