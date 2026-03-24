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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useData } from '@/lib/DataContext'
import type { Account, AccountDialogProps } from '@/lib/types'

export function AccountDialog({ open, onOpenChange, account }: AccountDialogProps) {
  const { addAccount, updateAccount } = useData()
  const isEditing = !!account

  const [formData, setFormData] = useState({
    bank: '',
    name: '',
    entity: 'personal',
    balance: '',
    monthlyInflow: '',
    monthlyOutflow: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  // Reset form when dialog opens/closes or account changes
  useEffect(() => {
    if (open) {
      if (account) {
        setFormData({
          bank: account.bank,
          name: account.name,
          entity: account.entity,
          balance: account.balance.toString(),
          monthlyInflow: account.monthlyInflow.toString(),
          monthlyOutflow: account.monthlyOutflow.toString(),
        })
      } else {
        setFormData({
          bank: '',
          name: '',
          entity: 'personal',
          balance: '',
          monthlyInflow: '',
          monthlyOutflow: '',
        })
      }
      setErrors({})
    }
  }, [open, account])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.bank.trim()) {
      newErrors.bank = 'Bank name is required'
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Account name is required'
    }
    if (!formData.balance || isNaN(Number(formData.balance))) {
      newErrors.balance = 'Valid balance is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return
    
    setSaving(true)
    
    try {
      const data = {
        bank: formData.bank.trim(),
        name: formData.name.trim(),
        entity: formData.entity,
        balance: Number(formData.balance) || 0,
        monthlyInflow: Number(formData.monthlyInflow) || 0,
        monthlyOutflow: Number(formData.monthlyOutflow) || 0,
        isAutoFD: false,
      }

      if (isEditing && account) {
        await updateAccount(account.id, data)
      } else {
        await addAccount(data)
      }
      
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save account:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Account' : 'Add Bank Account'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bank Name */}
          <div className="space-y-2">
            <Label htmlFor="bank">Bank Name *</Label>
            <Input
              id="bank"
              placeholder="e.g., SBI, HDFC, ICICI"
              value={formData.bank}
              onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
              className={errors.bank ? 'border-red-500' : ''}
            />
            {errors.bank && <p className="text-xs text-red-500">{errors.bank}</p>}
          </div>

          {/* Account Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Account Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Savings Account, Current Account"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Entity */}
          <div className="space-y-2">
            <Label htmlFor="entity">Entity</Label>
            <Select
              value={formData.entity}
              onValueChange={(value) => setFormData({ ...formData, entity: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="huf">HUF</SelectItem>
                <SelectItem value="firm">Firm</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Balance */}
          <div className="space-y-2">
            <Label htmlFor="balance">Balance (₹) *</Label>
            <Input
              id="balance"
              type="number"
              placeholder="e.g., 500000"
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              className={errors.balance ? 'border-red-500' : ''}
            />
            {errors.balance && <p className="text-xs text-red-500">{errors.balance}</p>}
          </div>

          {/* Monthly Inflow */}
          <div className="space-y-2">
            <Label htmlFor="monthlyInflow">Monthly Inflow (₹)</Label>
            <Input
              id="monthlyInflow"
              type="number"
              placeholder="e.g., 100000 (optional)"
              value={formData.monthlyInflow}
              onChange={(e) => setFormData({ ...formData, monthlyInflow: e.target.value })}
            />
          </div>

          {/* Monthly Outflow */}
          <div className="space-y-2">
            <Label htmlFor="monthlyOutflow">Monthly Outflow (₹)</Label>
            <Input
              id="monthlyOutflow"
              type="number"
              placeholder="e.g., 50000 (optional)"
              value={formData.monthlyOutflow}
              onChange={(e) => setFormData({ ...formData, monthlyOutflow: e.target.value })}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[var(--gold)] text-[var(--bg)] hover:bg-[var(--gold)]/90"
            >
              {saving ? 'Saving...' : (isEditing ? 'Update' : 'Add Account')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
