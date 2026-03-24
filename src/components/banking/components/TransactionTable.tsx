'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { fmt } from '@/lib/utils'
import { EntityBadge } from '@/components/ui/EntityBadge'
import { Search, Filter, AlertCircle, Plus, Trash2 } from 'lucide-react'
import { useData } from '@/lib/DataContext'
import { TransactionDialog } from './TransactionDialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { Transaction } from '@/lib/types'

interface TransactionTableProps {
  transactions?: Transaction[]
}

export function TransactionTable({ transactions: propTransactions }: TransactionTableProps) {
  const { transactions: contextTransactions, deleteTransaction } = useData()
  const transactions = propTransactions || contextTransactions
  
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)

  const handleDeleteClick = (tx: Transaction) => {
    setTransactionToDelete(tx)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (transactionToDelete) {
      await deleteTransaction(transactionToDelete.id)
      setTransactionToDelete(null)
    }
  }

  return (
    <>
      <Card title="All Transactions" noPadding>
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text3)]" />
            <input 
              type="text" 
              placeholder="Search transactions..." 
              className="w-full bg-[var(--surface2)] border border-[var(--border)] rounded-md py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-[var(--gold)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setTransactionDialogOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--gold)] text-[var(--bg)] text-[10px] font-bold uppercase shadow-sm"
            >
              <Plus size={12} /> Add Transaction
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--surface2)] border border-[var(--border)] text-[10px] font-bold uppercase text-[var(--text2)] hover:text-[var(--text)]">
              <Filter size={12} /> Category
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--surface2)] border border-[var(--border)] text-[10px] font-bold uppercase text-[var(--text2)] hover:text-[var(--text)]">
              <Filter size={12} /> Date Range
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase">Date</th>
                <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase">Description</th>
                <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase">Account</th>
                <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase">Category</th>
                <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase text-right">Debit</th>
                <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase text-right">Credit</th>
                <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase text-center">Entity</th>
                <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase text-center">AI Conf.</th>
                <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <TransactionRow 
                  key={tx.id} 
                  tx={tx} 
                  onDelete={handleDeleteClick}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <TransactionDialog
        open={transactionDialogOpen}
        onOpenChange={setTransactionDialogOpen}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${transactionToDelete?.description}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </>
  )
}

function TransactionRow({ tx, onDelete }: { tx: Transaction; onDelete: (tx: Transaction) => void }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <tr 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="border-b border-[var(--border)] hover:bg-[var(--surface2)] transition-colors group"
    >
      <td className="px-5 py-3 text-xs font-mono text-[var(--text2)]">{tx.date}</td>
      <td className="px-5 py-3 text-xs font-medium text-[var(--text)]">{tx.description}</td>
      <td className="px-5 py-3 text-xs text-[var(--text2)] uppercase tracking-tighter">{tx.account.replace('_', ' ')}</td>
      <td className="px-5 py-3">
        <CategoryBadge category={tx.category} />
      </td>
      <td className="px-5 py-3 text-xs font-mono font-bold text-right text-[var(--red)]">
        {tx.debit > 0 ? fmt(tx.debit, true) : '—'}
      </td>
      <td className="px-5 py-3 text-xs font-mono font-bold text-right text-[var(--green)]">
        {tx.credit > 0 ? fmt(tx.credit, true) : '—'}
      </td>
      <td className="px-5 py-3 text-center">
        <EntityBadge entity={tx.entity} />
      </td>
      <td className="px-5 py-3 text-center">
        <div className="flex items-center justify-center gap-1">
          <span className={`text-[10px] font-bold ${
            tx.aiConfidence > 90 ? 'text-[var(--green)]' :
            tx.aiConfidence > 70 ? 'text-[var(--amber)]' :
            'text-[var(--red)]'
          }`}>
            {tx.aiConfidence}%
          </span>
          {tx.aiConfidence <= 90 && tx.aiConfidence > 70 && <AlertCircle size={10} className="text-[var(--amber)]" />}
        </div>
      </td>
      <td className="px-5 py-3">
        {isHovered && (
          <button
            onClick={() => onDelete(tx)}
            className="p-1 rounded hover:bg-[var(--surface2)] transition-colors"
            title="Delete"
          >
            <Trash2 size={14} className="text-[var(--red)]" />
          </button>
        )}
      </td>
    </tr>
  )
}

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    Investment: 'var(--blue)',
    Salary: 'var(--green)',
    Dividend: 'var(--gold)',
    'FD Interest': 'var(--gold)',
    Utilities: 'var(--red)',
    'FD Creation': 'var(--text3)',
    Tax: 'var(--red)',
    Transfer: 'var(--text3)',
    Other: 'var(--text3)',
  }
  const color = colors[category] || 'var(--text3)'
  
  return (
    <span 
      className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {category}
    </span>
  )
}
