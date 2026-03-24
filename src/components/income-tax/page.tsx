'use client'

import React, { useState } from 'react'
import { Sparkles, Info } from 'lucide-react'
import { TabLayout } from '@/components/ui/TabLayout'
import { AIResponseModal } from '@/components/ui/AIResponseModal'
import { askAI } from '@/lib/ai-client'

// Import extracted components
import { RegimeComparison } from './components/RegimeComparison'
import { AdvanceTaxTimeline } from './components/AdvanceTaxTimeline'
import { BreakevenAnalysis } from './components/BreakevenAnalysis'
import { IncomeSummary } from './components/IncomeSummary'
import { LTCGUtilisation } from './components/LTCGUtilisation'

// Import extracted hook
import { useTaxCalculations } from './hooks/useTaxCalculations'

export default function IncomeTaxPage() {
  const {
    filteredAccounts,
    filteredFDs,
    filteredMFHoldings,
    filteredShareHoldings,
    incomeCalculations,
    taxCalculations,
    breakevenAnalysis,
    taxPaymentsResult,
    advanceTaxTimeline,
    hasRealData,
    ltcg,
    selectedFY,
  } = useTaxCalculations()

  const [aiModal, setAiModal] = useState({ 
    open: false, 
    loading: false, 
    response: '', 
    preview: '', 
    mode: 'basic' as const, 
    error: undefined as string | undefined, 
    question: '' 
  })

  const runAIAnalysis = async (question: string, skillPath?: string) => {
    setAiModal({ open: true, loading: true, response: '', preview: '', mode: 'basic', error: undefined, question })
    const result = await askAI(question, { 
      accounts: filteredAccounts, 
      fds: filteredFDs, 
      mfHoldings: filteredMFHoldings, 
      shareHoldings: filteredShareHoldings 
    }, skillPath)
    setAiModal(prev => ({ ...prev, loading: false, response: result.response, preview: result.sanitisedPreview, mode: result.mode, error: result.error }))
  }

  return (
    <TabLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            Income Tax
          </h1>
          <div style={{ fontSize: 14, color: 'var(--text2)' }}>
            {selectedFY} · <span style={{ fontWeight: 600, color: 'var(--green)' }}>{taxCalculations.isNewRegimeBetter ? 'New' : 'Old'} Regime recommended for Self & HUF</span>
          </div>
        </div>
        <button onClick={() => runAIAnalysis('Analyse my income and investments for tax optimisation. Which regime is better and what actions should I take before March 31?', 'income-tax/optimisation.md')} style={goldButtonStyle}><Sparkles size={16} /> Full Optimisation</button>
      </div>

      {/* Data Source Notice */}
      {!hasRealData && (
        <div style={{ 
          padding: '12px 16px', 
          background: 'rgba(212,175,55,0.08)', 
          border: '1px solid rgba(212,175,55,0.2)', 
          borderRadius: 'var(--radius)',
          marginBottom: 24 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Info size={16} color="var(--gold)" />
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>
              No transaction data available. Add transactions in Banking to see actual income calculations.
            </span>
          </div>
        </div>
      )}

      {/* Regime Comparison Section */}
      <RegimeComparison
        totalGrossIncome={incomeCalculations.totalGrossIncome}
        oldRegimeTaxable={taxCalculations.oldRegimeTaxable}
        oldRegimeTax={taxCalculations.oldRegimeTax}
        oldRegimeTotalTax={taxCalculations.oldRegimeTotalTax}
        newRegimeTaxable={taxCalculations.newRegimeTaxable}
        newRegimeTax={taxCalculations.newRegimeTax}
        newRegimeTotalTax={taxCalculations.newRegimeTotalTax}
        isNewRegimeBetter={taxCalculations.isNewRegimeBetter}
        taxDifference={taxCalculations.taxDifference}
      />

      {/* Advance Tax Timeline */}
      <AdvanceTaxTimeline
        timeline={advanceTaxTimeline}
        totalTaxPaid={taxPaymentsResult.totalTaxPaid}
        hasNoPayments={advanceTaxTimeline.every(t => t.paidAmount === 0)}
      />

      {/* Two Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Left: Breakeven Analysis */}
        <BreakevenAnalysis
          currentDeductions={breakevenAnalysis.currentDeductions}
          breakevenDeductions={breakevenAnalysis.breakevenDeductions}
          deductionGap={breakevenAnalysis.deductionGap}
        />

        {/* Right: Income Summary */}
        <IncomeSummary
          annualSalary={incomeCalculations.annualSalary}
          salaryTransactionCount={incomeCalculations.salaryTransactionCount}
          bankInterestEstimate={incomeCalculations.bankInterestEstimate}
          fdInterestTotal={incomeCalculations.fdInterestTotal}
          fdCount={filteredFDs.length}
          dividendIncome={incomeCalculations.dividendIncome}
          ltcgBooked={ltcg.booked}
          firmIncome={incomeCalculations.firmIncome}
          totalGrossIncome={incomeCalculations.totalGrossIncome}
        />
      </div>

      {/* LTCG Utilisation Card */}
      <LTCGUtilisation booked={ltcg.booked} limit={ltcg.limit} />

      {/* AI Response Modal */}
      <AIResponseModal
        isOpen={aiModal.open}
        onClose={() => setAiModal(prev => ({ ...prev, open: false }))}
        loading={aiModal.loading}
        response={aiModal.response}
        sanitisedPreview={aiModal.preview}
        mode={aiModal.mode}
        error={aiModal.error}
        question={aiModal.question}
      />
    </TabLayout>
  )
}

const goldButtonStyle: React.CSSProperties = {
  background: 'var(--gold)', color: 'var(--bg)', border: 'none', borderRadius: 'var(--radius)',
  padding: '10px 20px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
  cursor: 'pointer', boxShadow: '0 4px 12px rgba(212,175,55,0.2)'
}
