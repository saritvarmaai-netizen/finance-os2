'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useData } from '@/lib/DataContext'
import type { FixedDeposit, FDDialogProps } from '@/lib/types'

export function FDDialog({ open, onOpenChange, fd, mode }: FDDialogProps) {
  const { accounts, addFD, updateFD } = useData()
  
  // Form state
  const [accountId, setAccountId] = useState<string>('')
  const [entity, setEntity] = useState<string>('personal')
  const [principal, setPrincipal] = useState<string>('')
  const [rate, setRate] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [maturityDate, setMaturityDate] = useState<string>('')
  const [maturityAmount, setMaturityAmount] = useState<string>('')
  const [daysLeft, setDaysLeft] = useState<string>('')
  const [tdsExpected, setTdsExpected] = useState<string>('')
  const [isAutoFD, setIsAutoFD] = useState<boolean>(false)
  const [status, setStatus] = useState<string>('active')
  const [saving, setSaving] = useState<boolean>(false)

  // Calculate maturity amount and days left
  const calculateMaturity = () => {
    const principalNum = parseFloat(principal)
    const rateNum = parseFloat(rate)
    
    if (principalNum > 0 && rateNum > 0) {
      // Simple interest calculation for 1 year
      const maturity = Math.round(principalNum * (1 + rateNum / 100))
      setMaturityAmount(maturity.toString())
    }
  }

  // Calculate days left from dates
  const calculateDaysLeft = () => {
    if (maturityDate) {
      try {
        const maturity = new Date(maturityDate)
        const today = new Date()
        const diffTime = maturity.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        if (diffDays >= 0) {
          setDaysLeft(diffDays.toString())
          // Update status based on days left
          if (diffDays <= 0) {
            setStatus('matured')
          } else if (diffDays <= 30) {
            setStatus('maturing')
          } else {
            setStatus('active')
          }
        }
      } catch {
        // Invalid date, ignore
      }
    }
  }

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && fd) {
        setAccountId(fd.accountId || '')
        setEntity(fd.entity || 'personal')
        setPrincipal(fd.principal?.toString() || '')
        setRate(fd.rate?.toString() || '')
        setStartDate(fd.startDate || '')
        setMaturityDate(fd.maturityDate || '')
        setMaturityAmount(fd.maturityAmount?.toString() || '')
        setDaysLeft(fd.daysLeft?.toString() || '')
        setTdsExpected(fd.tdsExpected?.toString() || '')
        setIsAutoFD(fd.isAutoFD || false)
        setStatus(fd.status || 'active')
      } else {
        // Reset for add mode
        setAccountId('')
        setEntity('personal')
        setPrincipal('')
        setRate('')
        setStartDate('')
        setMaturityDate('')
        setMaturityAmount('')
        setDaysLeft('')
        setTdsExpected('')
        setIsAutoFD(false)
        setStatus('active')
      }
    }
  }, [open, mode, fd])

  // Auto-calculate maturity when principal or rate changes
  useEffect(() => {
    calculateMaturity()
  }, [principal, rate])

  // Auto-calculate days left when maturity date changes
  useEffect(() => {
    calculateDaysLeft()
  }, [maturityDate])

  const handleSave = async () => {
    // Validation
    if (!principal || parseFloat(principal) <= 0) {
      return
    }
    if (!rate || parseFloat(rate) <= 0) {
      return
    }
    if (!startDate || !maturityDate) {
      return
    }

    setSaving(true)
    try {
      const data = {
        accountId: accountId || null,
        entity,
        principal: parseFloat(principal),
        rate: parseFloat(rate),
        startDate,
        maturityDate,
        maturityAmount: parseFloat(maturityAmount) || 0,
        daysLeft: parseInt(daysLeft) || 0,
        tdsExpected: parseFloat(tdsExpected) || 0,
        isAutoFD,
        status,
      }

      if (mode === 'edit' && fd?.id) {
        await updateFD(fd.id, data)
      } else {
        await addFD(data)
      }
      
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save FD:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {mode === 'add' ? 'Add Fixed Deposit' : 'Edit Fixed Deposit'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Account Selection */}
          <div className="space-y-2">
            <Label htmlFor="account">Account (Optional)</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.bank} - {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Entity Selection */}
          <div className="space-y-2">
            <Label htmlFor="entity">Entity</Label>
            <Select value={entity} onValueChange={setEntity}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="huf">HUF</SelectItem>
                <SelectItem value="firm">Firm</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Principal and Rate */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="principal">Principal *</Label>
              <Input
                id="principal"
                type="number"
                placeholder="500000"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Interest Rate (%) *</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                placeholder="7.25"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="text"
                placeholder="03 Apr 2025"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maturityDate">Maturity Date *</Label>
              <Input
                id="maturityDate"
                type="text"
                placeholder="03 Apr 2026"
                value={maturityDate}
                onChange={(e) => setMaturityDate(e.target.value)}
              />
            </div>
          </div>

          {/* Maturity Amount and Days Left */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maturityAmount">Maturity Amount</Label>
              <Input
                id="maturityAmount"
                type="number"
                placeholder="Auto-calculated"
                value={maturityAmount}
                onChange={(e) => setMaturityAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="daysLeft">Days Left</Label>
              <Input
                id="daysLeft"
                type="number"
                placeholder="Auto-calculated"
                value={daysLeft}
                onChange={(e) => setDaysLeft(e.target.value)}
              />
            </div>
          </div>

          {/* TDS Expected */}
          <div className="space-y-2">
            <Label htmlFor="tdsExpected">TDS Expected</Label>
            <Input
              id="tdsExpected"
              type="number"
              placeholder="7219"
              value={tdsExpected}
              onChange={(e) => setTdsExpected(e.target.value)}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maturing">Maturing</SelectItem>
                <SelectItem value="matured">Matured</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Is Auto FD */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAutoFD"
              checked={isAutoFD}
              onCheckedChange={(checked) => setIsAutoFD(checked as boolean)}
            />
            <Label htmlFor="isAutoFD" className="cursor-pointer">
              Is Auto FD?
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !principal || !rate || !startDate || !maturityDate}
            className="bg-[var(--gold)] text-[var(--bg)] hover:bg-[var(--gold)]/90"
          >
            {saving ? 'Saving...' : (mode === 'add' ? 'Add FD' : 'Save Changes')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
