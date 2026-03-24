'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import type { ShareHoldingDialogProps } from '@/lib/types'

const EXCHANGES = ['NSE', 'BSE'] as const
const SECTORS = ['IT', 'Banking', 'Energy', 'Pharma', 'Auto', 'FMCG', 'Metals', 'Infrastructure', 'Other'] as const
const ENTITIES = ['personal', 'huf', 'firm'] as const
const TAX_TYPES = ['LTCG', 'STCG'] as const

interface FormData {
  symbol: string
  company: string
  exchange: string
  sector: string
  entity: string
  qty: string
  avgPrice: string
  cmp: string
  dividendFY: string
  taxType: string
}

const initialFormData: FormData = {
  symbol: '',
  company: '',
  exchange: 'NSE',
  sector: 'Other',
  entity: 'personal',
  qty: '',
  avgPrice: '',
  cmp: '',
  dividendFY: '0',
  taxType: 'LTCG',
}

export function ShareHoldingDialog({ open, onOpenChange, editHolding }: ShareHoldingDialogProps) {
  const { addShareHolding, updateShareHolding } = useData()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate form when editing
  useEffect(() => {
    if (editHolding) {
      setFormData({
        symbol: editHolding.symbol || '',
        company: editHolding.company || '',
        exchange: editHolding.exchange || 'NSE',
        sector: editHolding.sector || 'Other',
        entity: editHolding.entity || 'personal',
        qty: editHolding.qty?.toString() || '',
        avgPrice: editHolding.avgPrice?.toString() || '',
        cmp: editHolding.cmp?.toString() || '',
        dividendFY: editHolding.dividendFY?.toString() || '0',
        taxType: editHolding.taxType || 'LTCG',
      })
    } else {
      setFormData(initialFormData)
    }
    setErrors({})
  }, [editHolding, open])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Symbol is required'
    }
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required'
    }
    if (!formData.qty || parseFloat(formData.qty) <= 0) {
      newErrors.qty = 'Quantity must be greater than 0'
    }
    if (!formData.avgPrice || parseFloat(formData.avgPrice) <= 0) {
      newErrors.avgPrice = 'Average price must be greater than 0'
    }
    if (!formData.cmp || parseFloat(formData.cmp) <= 0) {
      newErrors.cmp = 'Current market price must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const data = {
        symbol: formData.symbol.toUpperCase(),
        company: formData.company,
        exchange: formData.exchange,
        sector: formData.sector,
        entity: formData.entity,
        qty: parseFloat(formData.qty),
        avgPrice: parseFloat(formData.avgPrice),
        cmp: parseFloat(formData.cmp),
        dividendFY: parseFloat(formData.dividendFY) || 0,
        taxType: formData.taxType,
      }

      if (editHolding) {
        await updateShareHolding(editHolding.id, data)
      } else {
        await addShareHolding(data)
      }

      onOpenChange(false)
      setFormData(initialFormData)
    } catch (error) {
      console.error('Failed to save share holding:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editHolding ? 'Edit Share Holding' : 'Add Share Holding'}
          </DialogTitle>
          <DialogDescription>
            {editHolding
              ? 'Update the details of your share holding.'
              : 'Add a new share holding to your portfolio.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Row 1: Symbol & Company */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol *</Label>
              <Input
                id="symbol"
                placeholder="e.g., INFY"
                value={formData.symbol}
                onChange={(e) => updateField('symbol', e.target.value)}
                className={errors.symbol ? 'border-red-500' : ''}
              />
              {errors.symbol && (
                <p className="text-xs text-red-500">{errors.symbol}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                placeholder="e.g., Infosys Ltd"
                value={formData.company}
                onChange={(e) => updateField('company', e.target.value)}
                className={errors.company ? 'border-red-500' : ''}
              />
              {errors.company && (
                <p className="text-xs text-red-500">{errors.company}</p>
              )}
            </div>
          </div>

          {/* Row 2: Exchange & Sector */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exchange">Exchange</Label>
              <Select
                value={formData.exchange}
                onValueChange={(value) => updateField('exchange', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select exchange" />
                </SelectTrigger>
                <SelectContent>
                  {EXCHANGES.map((ex) => (
                    <SelectItem key={ex} value={ex}>
                      {ex}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sector">Sector</Label>
              <Select
                value={formData.sector}
                onValueChange={(value) => updateField('sector', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Entity & Tax Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entity">Entity</Label>
              <Select
                value={formData.entity}
                onValueChange={(value) => updateField('entity', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
                <SelectContent>
                  {ENTITIES.map((e) => (
                    <SelectItem key={e} value={e}>
                      {e.charAt(0).toUpperCase() + e.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxType">Tax Type</Label>
              <Select
                value={formData.taxType}
                onValueChange={(value) => updateField('taxType', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select tax type" />
                </SelectTrigger>
                <SelectContent>
                  {TAX_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 4: Quantity & Avg Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qty">Quantity *</Label>
              <Input
                id="qty"
                type="number"
                placeholder="e.g., 50"
                value={formData.qty}
                onChange={(e) => updateField('qty', e.target.value)}
                className={errors.qty ? 'border-red-500' : ''}
              />
              {errors.qty && (
                <p className="text-xs text-red-500">{errors.qty}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="avgPrice">Average Price *</Label>
              <Input
                id="avgPrice"
                type="number"
                step="0.01"
                placeholder="e.g., 1450"
                value={formData.avgPrice}
                onChange={(e) => updateField('avgPrice', e.target.value)}
                className={errors.avgPrice ? 'border-red-500' : ''}
              />
              {errors.avgPrice && (
                <p className="text-xs text-red-500">{errors.avgPrice}</p>
              )}
            </div>
          </div>

          {/* Row 5: CMP & Dividend */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cmp">Current Market Price *</Label>
              <Input
                id="cmp"
                type="number"
                step="0.01"
                placeholder="e.g., 1685"
                value={formData.cmp}
                onChange={(e) => updateField('cmp', e.target.value)}
                className={errors.cmp ? 'border-red-500' : ''}
              />
              {errors.cmp && (
                <p className="text-xs text-red-500">{errors.cmp}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dividendFY">Dividend FY</Label>
              <Input
                id="dividendFY"
                type="number"
                step="0.01"
                placeholder="e.g., 6400"
                value={formData.dividendFY}
                onChange={(e) => updateField('dividendFY', e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[var(--gold)] text-[var(--bg)] hover:bg-[var(--gold)]/90"
          >
            {isSubmitting ? 'Saving...' : editHolding ? 'Update' : 'Add Stock'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
