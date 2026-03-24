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
import type { MFHoldingDialogProps, MFHoldingRaw } from '@/lib/types'

// AMC options
const AMC_OPTIONS = [
  'PPFAS',
  'Mirae Asset',
  'SBI MF',
  'HDFC MF',
  'ICICI Prudential',
  'Axis MF',
  'Kotak',
  'Other',
] as const

// Category options
const CATEGORY_OPTIONS = [
  'Flexi Cap',
  'Large Cap',
  'Mid Cap',
  'Small Cap',
  'ELSS',
  'Debt',
  'Hybrid',
  'Other',
] as const

// Entity options
const ENTITY_OPTIONS = ['personal', 'huf', 'firm'] as const

// Tax type options
const TAX_TYPE_OPTIONS = ['LTCG', 'STCG'] as const

interface FormData {
  name: string
  amc: string
  category: string
  entity: string
  units: string
  avgNAV: string
  currentNAV: string
  xirr: string
  taxType: string
}

const initialFormData: FormData = {
  name: '',
  amc: 'PPFAS',
  category: 'Flexi Cap',
  entity: 'personal',
  units: '',
  avgNAV: '',
  currentNAV: '',
  xirr: '',
  taxType: 'LTCG',
}

export function MFHoldingDialog({ open, onOpenChange, editData }: MFHoldingDialogProps) {
  const { addMFHolding, updateMFHolding } = useData()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditMode = !!editData

  // Populate form when editing
  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || '',
        amc: editData.amc || 'PPFAS',
        category: editData.category || 'Flexi Cap',
        entity: editData.entity || 'personal',
        units: editData.units?.toString() || '',
        avgNAV: editData.avgNAV?.toString() || '',
        currentNAV: editData.currentNAV?.toString() || '',
        xirr: editData.xirr?.toString() || '',
        taxType: editData.taxType || 'LTCG',
      })
    } else {
      setFormData(initialFormData)
    }
    setErrors({})
  }, [editData, open])

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Scheme name is required'
    }

    if (!formData.units || isNaN(parseFloat(formData.units)) || parseFloat(formData.units) <= 0) {
      newErrors.units = 'Valid units required'
    }

    if (!formData.avgNAV || isNaN(parseFloat(formData.avgNAV)) || parseFloat(formData.avgNAV) <= 0) {
      newErrors.avgNAV = 'Valid average NAV required'
    }

    if (!formData.currentNAV || isNaN(parseFloat(formData.currentNAV)) || parseFloat(formData.currentNAV) <= 0) {
      newErrors.currentNAV = 'Valid current NAV required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    try {
      const data = {
        name: formData.name.trim(),
        amc: formData.amc,
        category: formData.category,
        entity: formData.entity,
        units: parseFloat(formData.units),
        avgNAV: parseFloat(formData.avgNAV),
        currentNAV: parseFloat(formData.currentNAV),
        xirr: formData.xirr ? parseFloat(formData.xirr) : 0,
        taxType: formData.taxType,
      }

      if (isEditMode && editData) {
        await updateMFHolding(editData.id, data)
      } else {
        await addMFHolding(data)
      }

      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save MF holding:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: '"Playfair Display", serif' }}>
            {isEditMode ? 'Edit Mutual Fund Holding' : 'Add Mutual Fund Holding'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Scheme Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Scheme Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Parag Parikh Flexi Cap Fund"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* AMC and Category - Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>AMC</Label>
              <Select
                value={formData.amc}
                onValueChange={value => handleInputChange('amc', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select AMC" />
                </SelectTrigger>
                <SelectContent>
                  {AMC_OPTIONS.map(amc => (
                    <SelectItem key={amc} value={amc}>
                      {amc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={value => handleInputChange('category', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Entity and Tax Type - Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Entity</Label>
              <Select
                value={formData.entity}
                onValueChange={value => handleInputChange('entity', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Entity" />
                </SelectTrigger>
                <SelectContent>
                  {ENTITY_OPTIONS.map(entity => (
                    <SelectItem key={entity} value={entity}>
                      {entity.charAt(0).toUpperCase() + entity.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tax Type</Label>
              <Select
                value={formData.taxType}
                onValueChange={value => handleInputChange('taxType', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Tax Type" />
                </SelectTrigger>
                <SelectContent>
                  {TAX_TYPE_OPTIONS.map(tax => (
                    <SelectItem key={tax} value={tax}>
                      {tax}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Units and XIRR - Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="units">Units *</Label>
              <Input
                id="units"
                type="number"
                step="0.001"
                placeholder="e.g., 245.678"
                value={formData.units}
                onChange={e => handleInputChange('units', e.target.value)}
                className={errors.units ? 'border-red-500' : ''}
              />
              {errors.units && <p className="text-xs text-red-500">{errors.units}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="xirr">XIRR (%)</Label>
              <Input
                id="xirr"
                type="number"
                step="0.1"
                placeholder="e.g., 22.4"
                value={formData.xirr}
                onChange={e => handleInputChange('xirr', e.target.value)}
              />
            </div>
          </div>

          {/* Average NAV and Current NAV - Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="avgNAV">Average NAV *</Label>
              <Input
                id="avgNAV"
                type="number"
                step="0.01"
                placeholder="e.g., 62.15"
                value={formData.avgNAV}
                onChange={e => handleInputChange('avgNAV', e.target.value)}
                className={errors.avgNAV ? 'border-red-500' : ''}
              />
              {errors.avgNAV && <p className="text-xs text-red-500">{errors.avgNAV}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentNAV">Current NAV *</Label>
              <Input
                id="currentNAV"
                type="number"
                step="0.01"
                placeholder="e.g., 82.45"
                value={formData.currentNAV}
                onChange={e => handleInputChange('currentNAV', e.target.value)}
                className={errors.currentNAV ? 'border-red-500' : ''}
              />
              {errors.currentNAV && <p className="text-xs text-red-500">{errors.currentNAV}</p>}
            </div>
          </div>

          {/* Computed values preview */}
          {formData.units && formData.avgNAV && formData.currentNAV &&
           !isNaN(parseFloat(formData.units)) && 
           !isNaN(parseFloat(formData.avgNAV)) && 
           !isNaN(parseFloat(formData.currentNAV)) && (
            <div className="p-4 rounded-lg bg-[var(--surface2)] border border-[var(--border)]">
              <div className="text-xs font-bold text-[var(--text3)] uppercase mb-3">Preview</div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-[var(--text3)]">Invested</div>
                  <div className="text-sm font-bold text-[var(--text)] font-mono">
                    ₹{Math.round(parseFloat(formData.units) * parseFloat(formData.avgNAV)).toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--text3)]">Current Value</div>
                  <div className="text-sm font-bold text-[var(--text)] font-mono">
                    ₹{Math.round(parseFloat(formData.units) * parseFloat(formData.currentNAV)).toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-[var(--text3)]">Gain/Loss</div>
                  <div className="text-sm font-bold font-mono" style={{
                    color: (parseFloat(formData.units) * parseFloat(formData.currentNAV)) >= 
                           (parseFloat(formData.units) * parseFloat(formData.avgNAV)) 
                           ? 'var(--green)' : 'var(--red)'
                  }}>
                    ₹{Math.round(parseFloat(formData.units) * parseFloat(formData.currentNAV) - 
                                parseFloat(formData.units) * parseFloat(formData.avgNAV)).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[var(--gold)] text-[var(--bg)] hover:bg-[var(--gold)]/90"
            >
              {isSubmitting ? 'Saving...' : (isEditMode ? 'Update' : 'Add Fund')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
