'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { formatINR } from '@/lib/format'
import { EntityBadge } from '@/components/ui/EntityBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { PiggyBank, Plus, Pencil, Trash2 } from 'lucide-react'
import { useData } from '@/lib/DataContext'
import { FDDialog } from './FDDialog'
import type { FixedDeposit } from '@/lib/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

export function FDTracker() {
  const { fds, deleteFD, accounts } = useData()
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [selectedFD, setSelectedFD] = useState<FixedDeposit | null>(null)
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fdToDelete, setFdToDelete] = useState<FixedDeposit | null>(null)

  const totalFD = useMemo(() => 
    fds.reduce((sum, fd) => sum + fd.principal, 0),
    [fds]
  )
  const maturingSoon = useMemo(() => 
    fds.filter(fd => fd.daysLeft < 30 && fd.status !== 'matured').length,
    [fds]
  )

  const handleAddFD = () => {
    setDialogMode('add')
    setSelectedFD(null)
    setDialogOpen(true)
  }

  const handleEditFD = (fd: FixedDeposit) => {
    setDialogMode('edit')
    setSelectedFD(fd)
    setDialogOpen(true)
  }

  const handleDeleteClick = (fd: FixedDeposit) => {
    setFdToDelete(fd)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (fdToDelete) {
      await deleteFD(fdToDelete.id)
      setDeleteDialogOpen(false)
      setFdToDelete(null)
    }
  }

  // Get account name for FD
  const getAccountName = (fd: FixedDeposit) => {
    if (fd.account) {
      return fd.account.name
    }
    const account = accounts.find(a => a.id === fd.accountId)
    return account?.name || 'N/A'
  }

  const getAccountBank = (fd: FixedDeposit) => {
    if (fd.account) {
      return fd.account.bank
    }
    const account = accounts.find(a => a.id === fd.accountId)
    return account?.bank || 'N/A'
  }

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const colors: Record<string, { bg: string; text: string }> = {
      active: { bg: 'rgba(34,197,94,0.15)', text: 'var(--green)' },
      maturing: { bg: 'rgba(251,146,60,0.15)', text: 'var(--amber)' },
      matured: { bg: 'rgba(107,114,128,0.15)', text: 'var(--text3)' },
    }
    const { bg, text } = colors[status] || colors.active
    
    return (
      <span
        style={{
          display: 'inline-flex',
          padding: '3px 9px',
          borderRadius: 20,
          fontSize: 10,
          fontWeight: 700,
          color: text,
          background: bg,
          textTransform: 'uppercase',
        }}
      >
        {status}
      </span>
    )
  }

  return (
    <>
      <Card
        title="Fixed Deposit Tracker"
        action={
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[10px] font-bold text-[var(--text3)] uppercase">Total FD</p>
              <p className="text-sm font-bold text-[var(--gold)]">{formatINR(totalFD, true)}</p>
            </div>
            {maturingSoon > 0 && (
              <span className="bg-[var(--red)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                {maturingSoon} Maturing Soon
              </span>
            )}
            <Button
              size="sm"
              onClick={handleAddFD}
              className="bg-[var(--gold)] text-[var(--bg)] hover:bg-[var(--gold)]/90 h-7"
            >
              <Plus size={14} />
              Add FD
            </Button>
          </div>
        }
        noPadding
      >
        {fds.length === 0 ? (
          <EmptyState
            icon={PiggyBank}
            title="No fixed deposits"
            description="Add FDs to track maturity dates, interest rates, and TDS expectations."
            actionLabel="Add FD"
            onAction={handleAddFD}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase">Account</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase">Entity</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase text-right">Principal</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase text-center">Rate</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase">Maturity</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase text-right">Maturity Amt</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase text-center">Days Left</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase">Status</th>
                  <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fds.map((fd) => (
                  <tr key={fd.id} className="border-b border-[var(--border)] hover:bg-[var(--surface2)] transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-xs font-bold text-[var(--text)]">{getAccountName(fd as FD)}</p>
                      <p className="text-[9px] text-[var(--text3)] uppercase">{getAccountBank(fd as FD)}</p>
                    </td>
                    <td className="px-5 py-3">
                      <EntityBadge entity={fd.entity} />
                    </td>
                    <td className="px-5 py-3 text-xs font-mono font-bold text-right text-[var(--text)]">{formatINR(fd.principal, true)}</td>
                    <td className="px-5 py-3 text-xs font-mono font-bold text-center text-[var(--green)]">{fd.rate}%</td>
                    <td className="px-5 py-3 text-xs font-mono text-[var(--text2)]">{fd.maturityDate}</td>
                    <td className="px-5 py-3 text-xs font-mono font-bold text-right text-[var(--text)]">{formatINR(fd.maturityAmount, true)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        fd.daysLeft < 30 ? 'bg-[var(--red)]/10 text-[var(--red)]' :
                        fd.daysLeft < 90 ? 'bg-[var(--amber)]/10 text-[var(--amber)]' :
                        'bg-[var(--green)]/10 text-[var(--green)]'
                      }`}>
                        {fd.daysLeft}d
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={fd.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEditFD(fd as FD)}
                          className="p-1.5 rounded hover:bg-[var(--surface2)] text-[var(--text3)] hover:text-[var(--text)] transition-colors"
                          title="Edit FD"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(fd as FD)}
                          className="p-1.5 rounded hover:bg-[var(--red)]/10 text-[var(--text3)] hover:text-[var(--red)] transition-colors"
                          title="Delete FD"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add/Edit FD Dialog */}
      <FDDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        fd={selectedFD}
        mode={dialogMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fixed Deposit</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this fixed deposit?
              {fdToDelete && (
                <div className="mt-3 p-3 bg-[var(--surface2)] rounded-md">
                  <p className="text-sm font-medium text-[var(--text)]">
                    Principal: {formatINR(fdToDelete.principal)}
                  </p>
                  <p className="text-xs text-[var(--text3)]">
                    Rate: {fdToDelete.rate}% | Maturity: {fdToDelete.maturityDate}
                  </p>
                </div>
              )}
              <p className="mt-2 text-[var(--red)]">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-[var(--red)] hover:bg-[var(--red)]/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
