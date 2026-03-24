'use client'

import { useMemo } from 'react'
import { useData } from '@/lib/DataContext'
import { useEntity } from '@/lib/entity-context'
import type { AdvanceTaxPayment, Transaction } from '@/lib/types'

export interface IncomeCalculationResult {
  annualSalary: number
  bankInterestEstimate: number
  fdInterestTotal: number
  dividendIncome: number
  firmIncome: number
  totalGrossIncome: number
  salaryTransactionCount: number
}

export interface TaxCalculationResult {
  oldRegimeTaxable: number
  oldRegimeTax: number
  oldRegimeTotalTax: number
  newRegimeTaxable: number
  newRegimeTax: number
  newRegimeTotalTax: number
  isNewRegimeBetter: boolean
  taxDifference: number
}

export interface BreakevenResult {
  currentDeductions: number
  breakevenDeductions: number
  deductionGap: number
}

export interface TaxPaymentsResult {
  taxPayments: Transaction[]
  totalTaxPaid: number
}

export function useTaxCalculations() {
  const { accounts, fds, transactions, mfHoldings, shareHoldings, selectedFY, ltcg } = useData()
  const { isActive } = useEntity()

  // Filter data by active entity
  const filteredAccounts = useMemo(() => 
    accounts.filter(a => isActive(a.entity)),
    [accounts, isActive]
  )
  const filteredFDs = useMemo(() => 
    fds.filter(f => isActive(f.entity)),
    [fds, isActive]
  )
  const filteredTransactions = useMemo(() => 
    transactions.filter(t => isActive(t.entity)),
    [transactions, isActive]
  )
  const filteredShareHoldings = useMemo(() => 
    shareHoldings.filter(h => isActive(h.entity)),
    [shareHoldings, isActive]
  )

  // Calculate income from real transactions
  const incomeCalculations = useMemo((): IncomeCalculationResult => {
    const salaryTransactions = filteredTransactions.filter(t => t.category === 'Salary')
    const monthlySalary = salaryTransactions.reduce((sum, t) => sum + t.credit, 0)
    const annualSalary = monthlySalary * 12

    const bankInterestEstimate = filteredAccounts.reduce((sum, a) => sum + (a.balance * 0.03), 0)
    const fdInterestTotal = filteredFDs.reduce((sum, f) => sum + (f.maturityAmount - f.principal), 0)
    const dividendIncome = filteredShareHoldings.reduce((sum, s) => sum + s.dividendFY, 0)
    
    // Firm income from transactions
    const firmTransactions = transactions.filter(t => t.entity === 'firm' && t.credit > 0)
    const firmIncome = firmTransactions.reduce((sum, t) => sum + t.credit, 0)

    const totalGrossIncome = annualSalary + bankInterestEstimate + fdInterestTotal + dividendIncome + ltcg.booked + firmIncome

    return { 
      annualSalary, 
      bankInterestEstimate, 
      fdInterestTotal, 
      dividendIncome, 
      firmIncome, 
      totalGrossIncome, 
      salaryTransactionCount: salaryTransactions.length 
    }
  }, [filteredTransactions, filteredAccounts, filteredFDs, filteredShareHoldings, transactions, ltcg.booked])

  // Tax calculations
  const taxCalculations = useMemo((): TaxCalculationResult => {
    const { totalGrossIncome } = incomeCalculations
    
    const oldRegimeTaxable = totalGrossIncome - 50000 - 150000 - 25000 - 35000
    const oldRegimeTax = oldRegimeTaxable > 500000 ? (oldRegimeTaxable * 0.3) : 0
    const oldRegimeTotalTax = oldRegimeTax * 1.04

    const newRegimeTaxable = totalGrossIncome - 75000
    const newRegimeTax = newRegimeTaxable > 700000 ? (newRegimeTaxable * 0.2) : 0
    const newRegimeTotalTax = newRegimeTax * 1.04

    const isNewRegimeBetter = newRegimeTotalTax <= oldRegimeTotalTax
    const taxDifference = Math.abs(oldRegimeTotalTax - newRegimeTotalTax)

    return { 
      oldRegimeTaxable, 
      oldRegimeTax, 
      oldRegimeTotalTax, 
      newRegimeTaxable, 
      newRegimeTax, 
      newRegimeTotalTax, 
      isNewRegimeBetter, 
      taxDifference 
    }
  }, [incomeCalculations])

  // Breakeven analysis
  const breakevenAnalysis = useMemo((): BreakevenResult => {
    const currentDeductions = 50000 + 150000 + 25000 + 35000 // Standard + 80C + 80D + NPS
    const breakevenDeductions = 262000 // Approximate value where old regime becomes better
    const deductionGap = Math.max(0, breakevenDeductions - currentDeductions)

    return { currentDeductions, breakevenDeductions, deductionGap }
  }, [])

  // Tax payments
  const taxPaymentsResult = useMemo((): TaxPaymentsResult => {
    const taxPayments = filteredTransactions.filter(t => t.category === 'Tax')
    const totalTaxPaid = taxPayments.reduce((sum, t) => sum + t.debit, 0)
    return { taxPayments, totalTaxPaid }
  }, [filteredTransactions])

  // Advance tax timeline from real data
  const advanceTaxTimeline = useMemo((): AdvanceTaxPayment[] => {
    const { isNewRegimeBetter, newRegimeTotalTax, oldRegimeTotalTax } = taxCalculations
    const { taxPayments } = taxPaymentsResult
    const estimatedAnnualTax = isNewRegimeBetter ? newRegimeTotalTax : oldRegimeTotalTax
    const currentFY = selectedFY
    
    const fyMatch = currentFY.match(/FY (\d{4})-(\d{2})/)
    const fyStartYear = fyMatch ? parseInt(fyMatch[1]) : 2025
    
    const quarters = [
      { quarter: 'Q1', label: 'Q1 15%', percentage: 0.15, dueDate: `15 Jun ${fyStartYear}` },
      { quarter: 'Q2', label: 'Q2 45%', percentage: 0.45, dueDate: `15 Sep ${fyStartYear}` },
      { quarter: 'Q3', label: 'Q3 75%', percentage: 0.75, dueDate: `15 Dec ${fyStartYear}` },
      { quarter: 'Q4', label: 'Q4 100%', percentage: 1.0, dueDate: `15 Mar ${fyStartYear + 1}` },
    ]

    const paymentsByQuarter: Record<string, number> = {
      'Q1': 0, 'Q2': 0, 'Q3': 0, 'Q4': 0
    }

    taxPayments.forEach(t => {
      const dateStr = t.date || ''
      const monthMatch = dateStr.match(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/)
      if (monthMatch) {
        const month = monthMatch[0]
        if (['Apr', 'May', 'Jun'].includes(month)) paymentsByQuarter['Q1'] += t.debit
        else if (['Jul', 'Aug', 'Sep'].includes(month)) paymentsByQuarter['Q2'] += t.debit
        else if (['Oct', 'Nov', 'Dec'].includes(month)) paymentsByQuarter['Q3'] += t.debit
        else if (['Jan', 'Feb', 'Mar'].includes(month)) paymentsByQuarter['Q4'] += t.debit
      }
    })

    return quarters.map((q, idx) => {
      const requiredAmount = Math.round(estimatedAnnualTax * q.percentage)
      const paidAmount = paymentsByQuarter[q.quarter]
      const cumulativeRequired = Math.round(estimatedAnnualTax * quarters[idx].percentage)
      const cumulativePaid = Object.entries(paymentsByQuarter)
        .filter(([key]) => quarters.findIndex(qu => qu.quarter === key) <= idx)
        .reduce((sum, [, val]) => sum + val, 0)

      let status: 'PAID' | 'PARTIAL' | 'DUE' | 'OVERDUE' = 'DUE'
      const now = new Date()
      const dueDateObj = new Date(q.dueDate + ' ' + fyStartYear)
      
      if (cumulativePaid >= cumulativeRequired) {
        status = 'PAID'
      } else if (cumulativePaid > 0 && cumulativePaid < cumulativeRequired) {
        status = 'PARTIAL'
      } else if (now > dueDateObj && cumulativePaid < cumulativeRequired) {
        status = 'OVERDUE'
      }

      return {
        ...q,
        amount: requiredAmount,
        paidAmount,
        status
      }
    })
  }, [taxCalculations, selectedFY, taxPaymentsResult])

  // Check if we have any real data
  const hasRealData = filteredTransactions.length > 0 || filteredFDs.length > 0 || filteredShareHoldings.length > 0

  return {
    // Filtered data
    filteredAccounts,
    filteredFDs,
    filteredMFHoldings: useMemo(() => mfHoldings.filter(h => isActive(h.entity)), [mfHoldings, isActive]),
    filteredShareHoldings,
    
    // Calculations
    incomeCalculations,
    taxCalculations,
    breakevenAnalysis,
    taxPaymentsResult,
    advanceTaxTimeline,
    
    // Data status
    hasRealData,
    
    // Raw data
    ltcg,
    selectedFY,
  }
}
