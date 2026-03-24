'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { fmt } from '@/lib/utils'
import { EntityBadge } from '@/components/ui/EntityBadge'
import { ArrowUpRight, ArrowDownLeft, Pencil, Trash2 } from 'lucide-react'
import { useData } from '@/lib/DataContext'
import { AccountDialog } from './AccountDialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { Account, FD } from '@/lib/types'

interface AccountCardsProps {
  accounts?: Account[]
}

export function AccountCards({ accounts: propAccounts }: AccountCardsProps) {
  const { accounts: contextAccounts, deleteAccount } = useData()
  const accounts = propAccounts || contextAccounts
  
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null)

  const handleEdit = (acc: Account) => {
    setEditingAccount(acc)
    setAccountDialogOpen(true)
  }

  const handleDeleteClick = (acc: Account) => {
    setAccountToDelete(acc)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (accountToDelete) {
      await deleteAccount(accountToDelete.id)
      setAccountToDelete(null)
    }
  }

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-1 px-1 snap-x">
        {accounts.map((acc) => (
          <div key={acc.id} className="min-w-[280px] snap-start">
            <AccountCard 
              acc={acc} 
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          </div>
        ))}
      </div>

      <AccountDialog
        open={accountDialogOpen}
        onOpenChange={setAccountDialogOpen}
        account={editingAccount}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Account"
        message={`Are you sure you want to delete "${accountToDelete?.bank} ${accountToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </>
  )
}

function AccountCard({ acc, onEdit, onDelete }: { 
  acc: Account; 
  onEdit: (acc: Account) => void;
  onDelete: (acc: Account) => void;
}) {
  const [isHovered, setIsHovered] = useState(false)
  
  const colors: Record<string, string> = {
    personal: 'var(--personal)',
    huf: 'var(--green)',
    firm: 'var(--firm)',
  }
  const topColor = colors[acc.entity] || 'var(--text3)'

  return (
    <Card 
      noPadding 
      className="h-full border-t-4 relative"
      style={{ borderTopColor: topColor }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit/Delete buttons on hover */}
      {isHovered && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(acc); }}
            className="p-1 rounded bg-[var(--surface2)] border border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
            title="Edit"
          >
            <Pencil size={12} className="text-[var(--text2)]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(acc); }}
            className="p-1 rounded bg-[var(--surface2)] border border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
            title="Delete"
          >
            <Trash2 size={12} className="text-[var(--red)]" />
          </button>
        </div>
      )}

      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[10px] font-bold text-[var(--text3)] uppercase tracking-widest">{acc.bank}</p>
            <h3 className="text-sm font-bold text-[var(--text)]">{acc.name}</h3>
          </div>
          <EntityBadge entity={acc.entity} />
        </div>
        
        <div className="mb-6">
          <span className="text-2xl font-playfair font-bold text-[var(--text)]">{fmt(acc.balance)}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1 text-[var(--green)]">
              <ArrowDownLeft size={12} />
              <span className="text-[10px] font-bold uppercase">Inflow</span>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--text2)]">{fmt(acc.monthlyInflow, true)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1 text-[var(--red)]">
              <ArrowUpRight size={12} />
              <span className="text-[10px] font-bold uppercase">Outflow</span>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--text2)]">{fmt(acc.monthlyOutflow, true)}</span>
          </div>
        </div>

        {(acc.fds && acc.fds.length > 0 || acc.isAutoFD) && (
          <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between">
            {acc.fds && acc.fds.length > 0 && (
              <span className="text-[10px] font-bold text-[var(--gold)] uppercase tracking-widest">
                {acc.fds.length} FD Active
              </span>
            )}
            {acc.interestClubbedTo && (
              <span className="text-[9px] bg-[var(--surface2)] text-[var(--text3)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                Interest Clubbed
              </span>
            )}
            {acc.isAutoFD && (
              <span className="text-[9px] bg-[rgba(251,146,60,0.1)] text-[var(--firm)] px-1.5 py-0.5 rounded border border-[rgba(251,146,60,0.2)]">
                Auto-FD
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
