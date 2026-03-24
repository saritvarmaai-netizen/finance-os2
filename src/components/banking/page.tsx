import React, { useState, useMemo } from 'react'
import { 
  Plus, 
  Sparkles, 
  FileText, 
  Landmark,
  Pencil,
  Trash2
} from 'lucide-react'
import { TabLayout } from '@/components/ui/TabLayout'
import { EntityBadge } from '@/components/ui/EntityBadge'
import { fmt } from '@/lib/utils'
import { useData } from '@/lib/DataContext'
import { useEntity } from '@/lib/entity-context'
import { askAI } from '@/lib/ai-client'
import { AIResponseModal } from '@/components/ui/AIResponseModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { AccountDialog } from './components/AccountDialog'
import { TransactionDialog } from './components/TransactionDialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FDTracker } from './components/FDTracker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Account, Transaction } from '@/lib/types'

export default function BankingPage() {
  const { accounts, fds, transactions, deleteAccount } = useData()
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

  // Dialog states
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null)

  const runAIAnalysis = async (question: string, skillPath?: string) => {
    setAiModal({ open: true, loading: true, response: '', preview: '', mode: 'basic', error: undefined, question })
    const result = await askAI(question, { accounts, fds, transactions: transactions.slice(0, 50) }, skillPath)
    setAiModal(prev => ({ ...prev, loading: false, response: result.response, preview: result.sanitisedPreview, mode: result.mode, error: result.error }))
  }

  const handleAddBankAccount = () => {
    setEditingAccount(null)
    setAccountDialogOpen(true)
  }

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account)
    setAccountDialogOpen(true)
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
          onAction={handleAddBankAccount}
        />
        <AccountDialog
          open={accountDialogOpen}
          onOpenChange={setAccountDialogOpen}
          account={editingAccount}
        />
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
          <button onClick={handleAddBankAccount} style={{
            background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            padding: '10px 20px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer', transition: 'all 0.2s'
          }}>
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

      {/* Account Cards */}
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 6, marginBottom: 32 }}>
        {filteredAccounts.map((acc) => (
          <AccountCard 
            key={acc.id} 
            acc={acc} 
            onEdit={handleEditAccount}
            onDelete={handleDeleteAccount}
          />
        ))}
      </div>

      {/* FD Tracker */}
      <div style={{ marginBottom: 32 }}>
        <FDTracker />
      </div>

      {/* Transaction Table */}
      <Card className="p-0 overflow-hidden">
        <CardHeader className="pb-2 border-b border-[var(--border)]">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <CardTitle className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text2)]">
              Master Ledger
            </CardTitle>
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
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--surface2)] hover:bg-[var(--surface2)]">
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text2)]">Date</TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text2)]">Description</TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text2)]">Account</TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text2)]">Category</TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text2)] text-right">Debit</TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text2)] text-right">Credit</TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text2)]">Entity</TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text2)] text-right">AI Conf.</TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text2)]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AccountDialog
        open={accountDialogOpen}
        onOpenChange={setAccountDialogOpen}
        account={editingAccount}
      />
      
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

// Account Card Component with Edit/Delete
function AccountCard({ acc, onEdit, onDelete }: { acc: Account; onEdit: (acc: Account) => void; onDelete: (acc: Account) => void }) {
  const [isHovered, setIsHovered] = useState(false)
  const colors: Record<string, string> = {
    personal: 'var(--personal)',
    huf: 'var(--green)',
    firm: 'var(--firm)',
  }
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
      {/* Edit/Delete buttons on hover */}
      {isHovered && (
        <div style={{
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'flex',
          gap: 4,
          zIndex: 10
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(acc); }}
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: 4,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Edit"
          >
            <Pencil size={14} color="var(--text2)" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(acc); }}
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              padding: 4,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Delete"
          >
            <Trash2 size={14} color="var(--red)" />
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
      <div style={{ display: 'flex', gap: 6, marginTop: 16 }}>
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

// Transaction Row Component with Delete
function TransactionRow({ tx }: { tx: { 
  id: string; 
  date: string; 
  description: string; 
  account: string; 
  category: string; 
  debit: number; 
  credit: number; 
  entity: string; 
  aiConfidence: number;
  isTransfer: boolean;
} }) {
  const { deleteTransaction } = useData()
  const [isHovered, setIsHovered] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const handleDelete = async () => {
    await deleteTransaction(tx.id)
  }

  return (
    <>
      <TableRow 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="cursor-pointer"
      >
        <TableCell className="text-[13px] text-[var(--text2)]">{tx.date}</TableCell>
        <TableCell className="text-[13px] text-[var(--text2)] font-semibold">{tx.description}</TableCell>
        <TableCell className="text-[13px] text-[var(--text2)]">{tx.account}</TableCell>
        <TableCell className="text-[13px] text-[var(--text2)]"><CategoryBadge category={tx.category} /></TableCell>
        <TableCell className="text-[13px] text-right font-mono" style={{ color: tx.debit > 0 ? 'var(--red)' : 'var(--text3)' }}>
          {tx.debit > 0 ? fmt(tx.debit) : '—'}
        </TableCell>
        <TableCell className="text-[13px] text-right font-mono" style={{ color: tx.credit > 0 ? 'var(--green)' : 'var(--text3)' }}>
          {tx.credit > 0 ? fmt(tx.credit) : '—'}
        </TableCell>
        <TableCell className="text-[13px] text-[var(--text2)]"><EntityBadge entity={tx.entity} /></TableCell>
        <TableCell className="text-[13px] text-right">
          <span style={{ 
            fontSize: 11, fontWeight: 700, 
            color: tx.aiConfidence >= 90 ? 'var(--green)' : tx.aiConfidence >= 70 ? 'var(--amber)' : 'var(--red)'
          }}>
            {tx.aiConfidence}%
          </span>
        </TableCell>
        <TableCell className="text-[13px] text-[var(--text2)]">
          {isHovered && (
            <button
              onClick={(e) => { e.stopPropagation(); setDeleteConfirmOpen(true); }}
              style={{
                background: 'transparent',
                border: 'none',
                borderRadius: 4,
                padding: 4,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Delete"
            >
              <Trash2 size={14} color="var(--red)" />
            </button>
          )}
        </TableCell>
      </TableRow>
      
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${tx.description}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  )
}

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
