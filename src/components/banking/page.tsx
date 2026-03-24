'use client'

import React, { useState, useMemo } from 'react'
import { 
  Plus, 
  Sparkles, 
  FileText, 
  Landmark
} from 'lucide-react'
import { TabLayout } from '@/components/ui/TabLayout'
import { EntityBadge } from '@/components/ui/EntityBadge'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { fmt } from '@/lib/utils'
import { useData } from '@/lib/DataContext'
import { useEntity } from '@/lib/entity-context'
import { askAI } from '@/lib/ai-client'
import { AIResponseModal } from '@/components/ui/AIResponseModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { TransactionDialog } from './components/TransactionDialog'
import { FDTracker } from './components/FDTracker'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { Account, FixedDeposit } from '@/lib/types'

// Input style for inline forms
const inputStyle: React.CSSProperties = {
  background: 'var(--surface2)', 
  border: '1px solid var(--border)',
  borderRadius: 6, 
  color: 'var(--text)', 
  fontFamily: 'inherit',
  fontSize: 13, 
  padding: '7px 10px', 
  outline: 'none', 
  width: 160,
}

const selectStyle: React.CSSProperties = {
  background: 'var(--surface2)', 
  border: '1px solid var(--border)',
  borderRadius: 6, 
  color: 'var(--text)', 
  fontFamily: 'inherit',
  fontSize: 13, 
  padding: '7px 10px', 
  outline: 'none', 
  width: 160,
  cursor: 'pointer',
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, 
  color: 'var(--text2)', 
  marginBottom: 4,
  display: 'block',
}

// Card style for consistent component look
const cardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
}

// Table styles matching Income & Expenses page
const tableHeaderStyle: React.CSSProperties = {
  padding: '10px 16px', textAlign: 'left',
  fontSize: 10, fontWeight: 600, letterSpacing: '0.8px',
  textTransform: 'uppercase', color: 'var(--text2)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--surface2)', whiteSpace: 'nowrap',
}

const tableCellStyle: React.CSSProperties = {
  padding: '12px 16px', fontSize: 13, color: 'var(--text2)',
  borderBottom: '1px solid var(--border)',
}

export default function BankingPage() {
  const { accounts, fds, transactions, deleteAccount, addAccount } = useData()
  const { isActive } = useEntity()

  const filteredAccounts = useMemo(() => 
    accounts.filter(a => isActive(a.entity)),
    [accounts, isActive]
  )
  const filteredTransactions = useMemo(() => 
    transactions.filter(t => isActive(t.entity)),
    [transactions, isActive]
  )

  const [aiModal, setAiModal] = useState({ open: false, loading: false, response: '', preview: '', mode: 'basic' as const, error: undefined as string | undefined, question: '' })

  // Inline Add Account form state
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [newAccount, setNewAccount] = useState({
    bank: '',
    name: '',
    entity: 'personal' as 'personal' | 'huf' | 'firm',
    balance: '',
    monthlyInflow: '',
    monthlyOutflow: '',
  })
  const [savingAccount, setSavingAccount] = useState(false)

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null)

  // Transaction dialog state
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)

  const runAIAnalysis = async (question: string, skillPath?: string) => {
    setAiModal({ open: true, loading: true, response: '', preview: '', mode: 'basic', error: undefined, question })
    const result = await askAI(question, { accounts, fds, transactions: transactions.slice(0, 50) }, skillPath)
    setAiModal(prev => ({ ...prev, loading: false, response: result.response, preview: result.sanitisedPreview, mode: result.mode, error: result.error }))
  }

  const handleAddAccount = () => {
    setShowAddAccount(true)
    setNewAccount({
      bank: '',
      name: '',
      entity: 'personal',
      balance: '',
      monthlyInflow: '',
      monthlyOutflow: '',
    })
  }

  const handleSaveAccount = async () => {
    if (!newAccount.bank || !newAccount.name || !newAccount.balance) return
    
    setSavingAccount(true)
    try {
      await addAccount({
        bank: newAccount.bank,
        name: newAccount.name,
        entity: newAccount.entity,
        balance: parseFloat(newAccount.balance) || 0,
        monthlyInflow: parseFloat(newAccount.monthlyInflow) || 0,
        monthlyOutflow: parseFloat(newAccount.monthlyOutflow) || 0,
        isAutoFD: false,
      })
      setShowAddAccount(false)
      setNewAccount({
        bank: '',
        name: '',
        entity: 'personal',
        balance: '',
        monthlyInflow: '',
        monthlyOutflow: '',
      })
    } finally {
      setSavingAccount(false)
    }
  }

  const handleCancelAddAccount = () => {
    setShowAddAccount(false)
    setNewAccount({
      bank: '',
      name: '',
      entity: 'personal',
      balance: '',
      monthlyInflow: '',
      monthlyOutflow: '',
    })
  }

  const handleDeleteAccount = (account: Account) => {
    setAccountToDelete(account)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteAccount = async () => {
    if (accountToDelete) {
      await deleteAccount(accountToDelete.id)
      setAccountToDelete(null)
    }
  }

  // Show empty state when no accounts exist
  if (filteredAccounts.length === 0) {
    return (
      <TabLayout>
        <EmptyState
          icon={Landmark}
          title="No bank accounts yet"
          description="Add your first bank account to start tracking your finances. You can import statements or add accounts manually."
          actionLabel="Add Bank Account"
          onAction={handleAddAccount}
        />
        
        {/* Inline Add Account Form for empty state */}
        {showAddAccount && (
          <div style={{ 
            background: 'var(--surface)', 
            border: '1px solid var(--border)', 
            borderRadius: 'var(--radius)', 
            padding: 20, 
            display: 'flex', 
            gap: 12, 
            alignItems: 'flex-end', 
            flexWrap: 'wrap', 
            marginTop: 24
          }}>
            <div>
              <div style={labelStyle}>Bank Name</div>
              <input 
                value={newAccount.bank} 
                onChange={(e) => setNewAccount(prev => ({ ...prev, bank: e.target.value }))}
                placeholder="e.g. SBI" 
                style={inputStyle} 
              />
            </div>
            <div>
              <div style={labelStyle}>Account Name</div>
              <input 
                value={newAccount.name} 
                onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Savings" 
                style={inputStyle} 
              />
            </div>
            <div>
              <div style={labelStyle}>Entity</div>
              <select 
                value={newAccount.entity} 
                onChange={(e) => setNewAccount(prev => ({ ...prev, entity: e.target.value as 'personal' | 'huf' | 'firm' }))}
                style={selectStyle}
              >
                <option value="personal">Self</option>
                <option value="huf">HUF</option>
                <option value="firm">Firm</option>
              </select>
            </div>
            <div>
              <div style={labelStyle}>Opening Balance</div>
              <input 
                type="number" 
                value={newAccount.balance} 
                onChange={(e) => setNewAccount(prev => ({ ...prev, balance: e.target.value }))}
                placeholder="0" 
                style={{ ...inputStyle, width: 120 }} 
              />
            </div>
            <button 
              onClick={handleSaveAccount} 
              disabled={savingAccount || !newAccount.bank || !newAccount.name || !newAccount.balance}
              style={{ 
                padding: '8px 18px', 
                borderRadius: 8, 
                border: 'none', 
                background: savingAccount || !newAccount.bank || !newAccount.name || !newAccount.balance ? 'var(--text3)' : 'var(--gold)', 
                color: '#000', 
                fontWeight: 700, 
                fontSize: 13, 
                cursor: savingAccount || !newAccount.bank || !newAccount.name || !newAccount.balance ? 'not-allowed' : 'pointer' 
              }}
            >
              {savingAccount ? 'Saving...' : 'Save'}
            </button>
            <button 
              onClick={handleCancelAddAccount} 
              style={{ 
                padding: '8px 14px', 
                borderRadius: 8, 
                border: '1px solid var(--border)', 
                background: 'transparent', 
                color: 'var(--text2)', 
                fontSize: 13, 
                cursor: 'pointer' 
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </TabLayout>
    )
  }

  return (
    <TabLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            Banking
          </h1>
          <div style={{ fontSize: 14, color: 'var(--text2)' }}>
            {filteredAccounts.length} accounts · <span style={{ fontWeight: 700, color: 'var(--text)' }}>{fmt(filteredAccounts.reduce((sum, a) => sum + a.balance, 0))}</span> total balance
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={() => setShowAddAccount(!showAddAccount)} 
            style={{
              background: showAddAccount ? 'var(--surface2)' : 'transparent', 
              color: showAddAccount ? 'var(--text)' : 'var(--text2)', 
              border: '1px solid var(--border)', 
              borderRadius: 'var(--radius)',
              padding: '10px 20px', 
              fontSize: 13, 
              fontWeight: 700, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8,
              cursor: 'pointer', 
              transition: 'all 0.2s'
            }}
          >
            <Plus size={16} />
            Add Account
          </button>
          <button onClick={() => alert('Bank Statement import process started...')} style={{
            background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            padding: '10px 20px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer', transition: 'all 0.2s'
          }}>
            <FileText size={16} />
            Import Statement
          </button>
          <button onClick={() => runAIAnalysis('Analyse my banking data. Identify unusual transactions, cash flow trends, and FD maturity risks.', 'banking/analysis.md')} style={{
            background: 'var(--gold)', color: 'var(--bg)', border: 'none', borderRadius: 'var(--radius)',
            padding: '10px 20px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(212,175,55,0.2)'
          }}>
            <Sparkles size={16} />
            Analyse
          </button>
        </div>
      </div>

      {/* Inline Add Account Form */}
      {showAddAccount && (
        <div style={{ 
          background: 'var(--surface)', 
          border: '1px solid var(--border)', 
          borderRadius: 'var(--radius)', 
          padding: 20, 
          display: 'flex', 
          gap: 12, 
          alignItems: 'flex-end', 
          flexWrap: 'wrap', 
          marginBottom: 32 
        }}>
          <div>
            <div style={labelStyle}>Bank Name</div>
            <input 
              value={newAccount.bank} 
              onChange={(e) => setNewAccount(prev => ({ ...prev, bank: e.target.value }))}
              placeholder="e.g. SBI" 
              style={inputStyle} 
            />
          </div>
          <div>
            <div style={labelStyle}>Account Name</div>
            <input 
              value={newAccount.name} 
              onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Savings" 
              style={inputStyle} 
            />
          </div>
          <div>
            <div style={labelStyle}>Entity</div>
            <select 
              value={newAccount.entity} 
              onChange={(e) => setNewAccount(prev => ({ ...prev, entity: e.target.value as 'personal' | 'huf' | 'firm' }))}
              style={selectStyle}
            >
              <option value="personal">Self</option>
              <option value="huf">HUF</option>
              <option value="firm">Firm</option>
            </select>
          </div>
          <div>
            <div style={labelStyle}>Opening Balance</div>
            <input 
              type="number" 
              value={newAccount.balance} 
              onChange={(e) => setNewAccount(prev => ({ ...prev, balance: e.target.value }))}
              placeholder="0" 
              style={{ ...inputStyle, width: 120 }} 
            />
          </div>
          <button 
            onClick={handleSaveAccount} 
            disabled={savingAccount || !newAccount.bank || !newAccount.name || !newAccount.balance}
            style={{ 
              padding: '8px 18px', 
              borderRadius: 8, 
              border: 'none', 
              background: savingAccount || !newAccount.bank || !newAccount.name || !newAccount.balance ? 'var(--text3)' : 'var(--gold)', 
              color: '#000', 
              fontWeight: 700, 
              fontSize: 13, 
              cursor: savingAccount || !newAccount.bank || !newAccount.name || !newAccount.balance ? 'not-allowed' : 'pointer' 
            }}
          >
            {savingAccount ? 'Saving...' : 'Save'}
          </button>
          <button 
            onClick={handleCancelAddAccount} 
            style={{ 
              padding: '8px 14px', 
              borderRadius: 8, 
              border: '1px solid var(--border)', 
              background: 'transparent', 
              color: 'var(--text2)', 
              fontSize: 13, 
              cursor: 'pointer' 
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Account Cards - Display only, no edit/delete buttons */}
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 6, marginBottom: 32 }}>
        {filteredAccounts.map((acc) => (
          <AccountCard 
            key={acc.id} 
            acc={acc} 
            fds={fds}
            onDelete={handleDeleteAccount}
          />
        ))}
      </div>

      {/* FD Tracker */}
      <div style={{ marginBottom: 32 }}>
        <FDTracker />
      </div>

      {/* Transaction Table */}
      <div style={{ ...cardStyle, padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionLabel>Master Ledger</SectionLabel>
          <div style={{ display: 'flex', gap: 10 }}>
            <button 
              onClick={() => setTransactionDialogOpen(true)}
              style={{
                background: 'var(--gold)', color: 'var(--bg)', border: 'none', borderRadius: 6,
                padding: '6px 12px', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
                cursor: 'pointer', boxShadow: '0 2px 8px rgba(212,175,55,0.2)'
              }}
            >
              <Plus size={14} />
              Add Transaction
            </button>
            <select
              style={{
                background: 'var(--surface2)', border: '1px solid var(--border)',
                color: 'var(--text2)', fontSize: 12, padding: '6px 12px',
                borderRadius: 6, outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <option>All Accounts</option>
              {accounts.map(acc => <option key={acc.id}>{acc.bank} {acc.name}</option>)}
            </select>
            <select
              style={{
                background: 'var(--surface2)', border: '1px solid var(--border)',
                color: 'var(--text2)', fontSize: 12, padding: '6px 12px',
                borderRadius: 6, outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>This Month</option>
              <option>This FY</option>
              <option>Last 3 Months</option>
              <option>Custom</option>
            </select>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Date</th>
                <th style={tableHeaderStyle}>Description</th>
                <th style={tableHeaderStyle}>Account</th>
                <th style={tableHeaderStyle}>Category</th>
                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Debit</th>
                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Credit</th>
                <th style={tableHeaderStyle}>Entity</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx, i) => (
                <tr 
                  key={tx.id || i}
                  onClick={() => setTransactionDialogOpen(true)}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                >
                  <td style={tableCellStyle}>{tx.date}</td>
                  <td style={{ ...tableCellStyle, fontWeight: 600 }}>{tx.description}</td>
                  <td style={tableCellStyle}>{tx.account}</td>
                  <td style={tableCellStyle}><CategoryBadge category={tx.category} /></td>
                  <td style={{ ...tableCellStyle, textAlign: 'right', fontFamily: '"JetBrains Mono", monospace', color: tx.debit > 0 ? 'var(--red)' : 'var(--text3)' }}>
                    {tx.debit > 0 ? fmt(tx.debit) : '—'}
                  </td>
                  <td style={{ ...tableCellStyle, textAlign: 'right', fontFamily: '"JetBrains Mono", monospace', color: tx.credit > 0 ? 'var(--green)' : 'var(--text3)' }}>
                    {tx.credit > 0 ? fmt(tx.credit) : '—'}
                  </td>
                  <td style={tableCellStyle}><EntityBadge entity={tx.entity} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialogs */}
      <TransactionDialog
        open={transactionDialogOpen}
        onOpenChange={setTransactionDialogOpen}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Account"
        message={`Are you sure you want to delete "${accountToDelete?.bank} ${accountToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDeleteAccount}
        variant="destructive"
      />

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

// Account Card Component - Display only, no edit/delete buttons on hover
function AccountCard({ acc, fds, onDelete }: { acc: Account; fds: FixedDeposit[]; onDelete: (acc: Account) => void }) {
  const [isHovered, setIsHovered] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const colors: Record<string, string> = {
    personal: 'var(--personal)',
    huf: 'var(--green)',
    firm: 'var(--firm)',
  }
  
  // Count FDs linked to this account
  const linkedFDs = fds.filter(fd => fd.accountId === acc.id)
  const fdCount = linkedFDs.length
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowActions(false); }}
      onClick={() => setShowActions(!showActions)}
      style={{
        minWidth: 280, flex: '0 0 auto',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderTop: `3px solid ${colors[acc.entity] || 'var(--text3)'}`,
        borderRadius: 'var(--radius)',
        padding: '18px 20px',
        transition: 'all 0.2s',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        boxShadow: isHovered ? '0 4px 28px rgba(0,0,0,0.38)' : 'none',
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      {/* Click to reveal actions menu */}
      {showActions && (
        <div style={{
          position: 'absolute',
          top: 8,
          right: 8,
          display: 'flex',
          gap: 4,
          zIndex: 10
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(acc); }}
            style={{
              background: 'var(--red)',
              border: 'none',
              borderRadius: 4,
              padding: '4px 10px',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 600,
              color: 'white',
            }}
            title="Delete"
          >
            Delete
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowActions(false); }}
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: '4px 10px',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--text2)',
            }}
          >
            Cancel
          </button>
        </div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{acc.bank}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{acc.name}</div>
        </div>
        <EntityBadge entity={acc.entity} />
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', fontFamily: '"Playfair Display", serif', marginBottom: 16 }}>
        {fmt(acc.balance)}
      </div>
      <div style={{ height: 1, background: 'var(--border)', marginBottom: 12 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 2 }}>Inflow</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', fontFamily: '"JetBrains Mono", monospace' }}>▲ {fmt(acc.monthlyInflow, true)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 2 }}>Outflow</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', fontFamily: '"JetBrains Mono", monospace' }}>▼ {fmt(acc.monthlyOutflow, true)}</div>
        </div>
      </div>
      {/* Badges: FD Active, Clubbed, Auto-FD */}
      <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
        {fdCount > 0 && (
          <span style={{ 
            padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700, 
            color: 'var(--blue)', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' 
          }}>
            {fdCount}FD Active
          </span>
        )}
        {acc.isClubbed && (
          <span style={{ 
            padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700, 
            color: 'var(--gold)', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' 
          }}>
            Clubbed
          </span>
        )}
        {acc.isAutoFD && (
          <span style={{ 
            padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700, 
            color: 'var(--firm)', background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)' 
          }}>
            Auto-FD
          </span>
        )}
      </div>
    </div>
  )
}

// CategoryBadge component for transaction categories
function CategoryBadge({ category }: { category: string }) {
  const styles: Record<string, { color: string; bg: string }> = {
    Investment: { color: 'var(--blue)', bg: 'rgba(59,130,246,0.1)' },
    Salary: { color: 'var(--green)', bg: 'rgba(16,185,129,0.1)' },
    Dividend: { color: 'var(--gold)', bg: 'rgba(212,175,55,0.1)' },
    'FD Interest': { color: 'var(--gold)', bg: 'rgba(212,175,55,0.1)' },
    Utilities: { color: 'var(--red)', bg: 'rgba(239,68,68,0.1)' },
    'FD Creation': { color: 'var(--firm)', bg: 'rgba(251,146,60,0.1)' },
    Tax: { color: 'var(--red)', bg: 'rgba(239,68,68,0.1)' },
    Other: { color: 'var(--text3)', bg: 'rgba(255,255,255,0.05)' },
    Transfer: { color: 'var(--text3)', bg: 'rgba(255,255,255,0.05)' },
  }
  const { color, bg } = styles[category] || styles.Other
  return (
    <span style={{
      display: 'inline-flex', padding: '2px 8px', borderRadius: 4,
      fontSize: 10, fontWeight: 700, color, background: bg
    }}>
      {category}
    </span>
  )
}
