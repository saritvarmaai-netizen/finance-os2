'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { formatINR } from '@/lib/format'
import { EntityBadge } from '@/components/ui/EntityBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { PiggyBank, Plus } from 'lucide-react'
import { useData } from '@/lib/DataContext'
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
  width: 140,
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
  width: 140,
  cursor: 'pointer',
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, 
  color: 'var(--text2)', 
  marginBottom: 4,
  display: 'block',
}

export function FDTracker() {
  const { fds, deleteFD, accounts, addFD } = useData()
  
  // Inline Add FD form state
  const [showAddFD, setShowAddFD] = useState(false)
  const [newFD, setNewFD] = useState({
    accountId: '',
    entity: 'personal' as 'personal' | 'huf' | 'firm',
    principal: '',
    rate: '',
    startDate: '',
    maturityDate: '',
    maturityAmount: '',
    daysLeft: '',
    tdsExpected: '',
    isAutoFD: false,
  })
  const [savingFD, setSavingFD] = useState(false)
  
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

  // Calculate maturity amount and days left
  const calculateMaturity = () => {
    const principalNum = parseFloat(newFD.principal)
    const rateNum = parseFloat(newFD.rate)
    
    if (principalNum > 0 && rateNum > 0) {
      // Simple interest calculation for 1 year
      const maturity = Math.round(principalNum * (1 + rateNum / 100))
      setNewFD(prev => ({ ...prev, maturityAmount: maturity.toString() }))
    }
  }

  const calculateDaysLeft = () => {
    if (newFD.maturityDate) {
      try {
        const maturity = new Date(newFD.maturityDate)
        const today = new Date()
        const diffTime = maturity.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        if (diffDays >= 0) {
          setNewFD(prev => ({ ...prev, daysLeft: diffDays.toString() }))
        }
      } catch {
        // Invalid date, ignore
      }
    }
  }

  // Auto-calculate maturity when principal or rate changes
  useMemo(() => {
    calculateMaturity()
  }, [newFD.principal, newFD.rate])

  // Auto-calculate days left when maturity date changes
  useMemo(() => {
    calculateDaysLeft()
  }, [newFD.maturityDate])

  const handleAddFD = () => {
    setShowAddFD(true)
    setNewFD({
      accountId: '',
      entity: 'personal',
      principal: '',
      rate: '',
      startDate: '',
      maturityDate: '',
      maturityAmount: '',
      daysLeft: '',
      tdsExpected: '',
      isAutoFD: false,
    })
  }

  const handleSaveFD = async () => {
    if (!newFD.principal || !newFD.rate || !newFD.startDate || !newFD.maturityDate) return
    
    setSavingFD(true)
    try {
      // Determine status based on days left
      let status: 'active' | 'maturing' | 'matured' = 'active'
      const days = parseInt(newFD.daysLeft) || 0
      if (days <= 0) {
        status = 'matured'
      } else if (days <= 30) {
        status = 'maturing'
      }

      await addFD({
        accountId: newFD.accountId || null,
        entity: newFD.entity,
        principal: parseFloat(newFD.principal) || 0,
        rate: parseFloat(newFD.rate) || 0,
        startDate: newFD.startDate,
        maturityDate: newFD.maturityDate,
        maturityAmount: parseFloat(newFD.maturityAmount) || 0,
        daysLeft: parseInt(newFD.daysLeft) || 0,
        tdsExpected: parseFloat(newFD.tdsExpected) || 0,
        isAutoFD: newFD.isAutoFD,
        status,
      })
      setShowAddFD(false)
      setNewFD({
        accountId: '',
        entity: 'personal',
        principal: '',
        rate: '',
        startDate: '',
        maturityDate: '',
        maturityAmount: '',
        daysLeft: '',
        tdsExpected: '',
        isAutoFD: false,
      })
    } finally {
      setSavingFD(false)
    }
  }

  const handleCancelAddFD = () => {
    setShowAddFD(false)
    setNewFD({
      accountId: '',
      entity: 'personal',
      principal: '',
      rate: '',
      startDate: '',
      maturityDate: '',
      maturityAmount: '',
      daysLeft: '',
      tdsExpected: '',
      isAutoFD: false,
    })
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
        {/* Inline Add FD Form */}
        {showAddFD && (
          <div style={{ 
            background: 'var(--surface)', 
            border: '1px solid var(--border)', 
            borderRadius: 'var(--radius)', 
            margin: 16,
            padding: 20, 
            display: 'flex', 
            gap: 12, 
            alignItems: 'flex-end', 
            flexWrap: 'wrap' 
          }}>
            <div>
              <div style={labelStyle}>Account</div>
              <select 
                value={newFD.accountId} 
                onChange={(e) => setNewFD(prev => ({ ...prev, accountId: e.target.value }))}
                style={{ ...selectStyle, width: 180 }}
              >
                <option value="">Select account</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.bank} - {acc.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div style={labelStyle}>Entity</div>
              <select 
                value={newFD.entity} 
                onChange={(e) => setNewFD(prev => ({ ...prev, entity: e.target.value as 'personal' | 'huf' | 'firm' }))}
                style={selectStyle}
              >
                <option value="personal">Self</option>
                <option value="huf">HUF</option>
                <option value="firm">Firm</option>
              </select>
            </div>
            <div>
              <div style={labelStyle}>Principal *</div>
              <input 
                type="number"
                value={newFD.principal} 
                onChange={(e) => setNewFD(prev => ({ ...prev, principal: e.target.value }))}
                placeholder="500000" 
                style={{ ...inputStyle, width: 120 }} 
              />
            </div>
            <div>
              <div style={labelStyle}>Rate (%) *</div>
              <input 
                type="number"
                step="0.01"
                value={newFD.rate} 
                onChange={(e) => setNewFD(prev => ({ ...prev, rate: e.target.value }))}
                placeholder="7.25" 
                style={{ ...inputStyle, width: 80 }} 
              />
            </div>
            <div>
              <div style={labelStyle}>Start Date *</div>
              <input 
                value={newFD.startDate} 
                onChange={(e) => setNewFD(prev => ({ ...prev, startDate: e.target.value }))}
                placeholder="03 Apr 2025" 
                style={{ ...inputStyle, width: 120 }} 
              />
            </div>
            <div>
              <div style={labelStyle}>Maturity Date *</div>
              <input 
                value={newFD.maturityDate} 
                onChange={(e) => setNewFD(prev => ({ ...prev, maturityDate: e.target.value }))}
                placeholder="03 Apr 2026" 
                style={{ ...inputStyle, width: 120 }} 
              />
            </div>
            <div>
              <div style={labelStyle}>TDS Expected</div>
              <input 
                type="number"
                value={newFD.tdsExpected} 
                onChange={(e) => setNewFD(prev => ({ ...prev, tdsExpected: e.target.value }))}
                placeholder="0" 
                style={{ ...inputStyle, width: 100 }} 
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <input 
                type="checkbox"
                id="isAutoFD"
                checked={newFD.isAutoFD}
                onChange={(e) => setNewFD(prev => ({ ...prev, isAutoFD: e.target.checked }))}
                style={{ width: 14, height: 14, cursor: 'pointer' }}
              />
              <label htmlFor="isAutoFD" style={{ fontSize: 11, color: 'var(--text2)', cursor: 'pointer' }}>
                Auto FD
              </label>
            </div>
            <button 
              onClick={handleSaveFD} 
              disabled={savingFD || !newFD.principal || !newFD.rate || !newFD.startDate || !newFD.maturityDate}
              style={{ 
                padding: '8px 18px', 
                borderRadius: 8, 
                border: 'none', 
                background: savingFD || !newFD.principal || !newFD.rate || !newFD.startDate || !newFD.maturityDate ? 'var(--text3)' : 'var(--gold)', 
                color: '#000', 
                fontWeight: 700, 
                fontSize: 13, 
                cursor: savingFD || !newFD.principal || !newFD.rate || !newFD.startDate || !newFD.maturityDate ? 'not-allowed' : 'pointer' 
              }}
            >
              {savingFD ? 'Saving...' : 'Save'}
            </button>
            <button 
              onClick={handleCancelAddFD} 
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
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleDeleteClick(fd as FD)}
                          className="text-[11px] font-semibold text-[var(--red)] hover:underline"
                        >
                          Delete
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

// Type for FD with account relation
type FD = FixedDeposit & {
  account?: {
    name: string
    bank: string
  }
}
