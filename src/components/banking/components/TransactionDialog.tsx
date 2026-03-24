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
import { Checkbox } from '@/components/ui/checkbox'
import { useData } from '@/lib/DataContext'

const CATEGORIES = [
  'Salary',
  'Investment',
  'Dividend',
  'FD Interest',
  'Tax',
  'Utilities',
  'Transfer',
  'Other',
] as const

interface TransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransactionDialog({ open, onOpenChange }: TransactionDialogProps) {
  const { addTransaction, accounts } = useData()
  
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    account: '',
    category: 'Other',
    debit: '',
    credit: '',
    entity: 'personal',
    isTransfer: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormData({
        date: '',
        description: '',
        account: accounts[0]?.id || '',
        category: 'Other',
        debit: '',
        credit: '',
        entity: 'personal',
        isTransfer: false,
      })
      setErrors({})
    }
  }, [open, accounts])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.date.trim()) {
      newErrors.date = 'Date is required'
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }
    if (!formData.account) {
      newErrors.account = 'Account is required'
    }
    if (!formData.debit && !formData.credit) {
      newErrors.amount = 'Either debit or credit amount is required'
    }
    if (formData.debit && isNaN(Number(formData.debit))) {
      newErrors.debit = 'Valid debit amount required'
    }
    if (formData.credit && isNaN(Number(formData.credit))) {
      newErrors.credit = 'Valid credit amount required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return
    
    setSaving(true)
    
    try {
      const selectedAccount = accounts.find(a => a.id === formData.account)
      
      await addTransaction({
        date: formData.date.trim(),
        description: formData.description.trim(),
        account: selectedAccount ? `${selectedAccount.bank} ${selectedAccount.name}` : formData.account,
        category: formData.category,
        debit: Number(formData.debit) || 0,
        credit: Number(formData.credit) || 0,
        entity: formData.entity,
        isTransfer: formData.isTransfer,
        aiConfidence: 100, // Manual entry has full confidence
      })
      
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to add transaction:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              placeholder="e.g., 21 Mar"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              placeholder="e.g., Salary credit, Rent payment"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>

          {/* Account */}
          <div className="space-y-2">
            <Label htmlFor="account">Account *</Label>
            <Select
              value={formData.account}
              onValueChange={(value) => setFormData({ ...formData, account: value })}
            >
              <SelectTrigger className={`w-full ${errors.account ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.bank} - {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.account && <p className="text-xs text-red-500">{errors.account}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Debit & Credit in a row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Debit */}
            <div className="space-y-2">
              <Label htmlFor="debit">Debit (₹)</Label>
              <Input
                id="debit"
                type="number"
                placeholder="e.g., 5000"
                value={formData.debit}
                onChange={(e) => setFormData({ ...formData, debit: e.target.value })}
                className={errors.debit ? 'border-red-500' : ''}
              />
              {errors.debit && <p className="text-xs text-red-500">{errors.debit}</p>}
            </div>

            {/* Credit */}
            <div className="space-y-2">
              <Label htmlFor="credit">Credit (₹)</Label>
              <Input
                id="credit"
                type="number"
                placeholder="e.g., 50000"
                value={formData.credit}
                onChange={(e) => setFormData({ ...formData, credit: e.target.value })}
                className={errors.credit ? 'border-red-500' : ''}
              />
              {errors.credit && <p className="text-xs text-red-500">{errors.credit}</p>}
            </div>
          </div>
          
          {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}

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

          {/* Is Transfer */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isTransfer"
              checked={formData.isTransfer}
              onCheckedChange={(checked) => setFormData({ ...formData, isTransfer: checked as boolean })}
            />
            <Label htmlFor="isTransfer" className="cursor-pointer">
              Is this a transfer between accounts?
            </Label>
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
              {saving ? 'Adding...' : 'Add Transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
