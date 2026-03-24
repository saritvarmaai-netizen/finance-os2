'use client'

import React, { useState } from 'react'
import { useData } from '@/lib/DataContext'

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

interface MFInlineAddFundProps {
  visible: boolean
  onClose: () => void
}

// Input style matching the GitHub reference
const inputStyle: React.CSSProperties = {
  background: 'var(--surface2)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  padding: '8px 10px',
  fontSize: 13,
  color: 'var(--text)',
  outline: 'none',
  width: '100%',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
}

export function MFInlineAddFund({ visible, onClose }: MFInlineAddFundProps) {
  const { addMFHolding } = useData()
  const [saving, setSaving] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    amc: 'PPFAS',
    category: 'Flexi Cap',
    entity: 'personal',
    units: '',
    avgNAV: '',
    currentNAV: '',
    xirr: '',
    taxType: 'LTCG',
  })

  if (!visible) return null

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim() || !formData.units || !formData.avgNAV || !formData.currentNAV) {
      return
    }

    setSaving(true)
    try {
      await addMFHolding({
        name: formData.name.trim(),
        amc: formData.amc,
        category: formData.category,
        entity: formData.entity,
        units: parseFloat(formData.units),
        avgNAV: parseFloat(formData.avgNAV),
        currentNAV: parseFloat(formData.currentNAV),
        xirr: formData.xirr ? parseFloat(formData.xirr) : 0,
        taxType: formData.taxType,
      })
      
      // Reset form
      setFormData({
        name: '',
        amc: 'PPFAS',
        category: 'Flexi Cap',
        entity: 'personal',
        units: '',
        avgNAV: '',
        currentNAV: '',
        xirr: '',
        taxType: 'LTCG',
      })
      
      onClose()
    } catch (error) {
      console.error('Failed to add fund:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ 
      background: 'var(--surface)', 
      border: '1px solid var(--border)', 
      borderRadius: 'var(--radius)', 
      padding: 20, 
      display: 'flex', 
      gap: 12, 
      alignItems: 'flex-end', 
      flexWrap: 'wrap', 
      marginBottom: 16 
    }}>
      {/* Fund Name */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>Fund Name *</div>
        <input
          type="text"
          placeholder="e.g. Parag Parikh Flexi Cap"
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          style={{ ...inputStyle, width: 220 }}
        />
      </div>
      
      {/* AMC */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>AMC</div>
        <select
          value={formData.amc}
          onChange={e => setFormData(prev => ({ ...prev, amc: e.target.value }))}
          style={{ ...selectStyle, width: 130 }}
        >
          {AMC_OPTIONS.map(amc => (
            <option key={amc} value={amc}>{amc}</option>
          ))}
        </select>
      </div>
      
      {/* Category */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>Category</div>
        <select
          value={formData.category}
          onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
          style={{ ...selectStyle, width: 120 }}
        >
          {CATEGORY_OPTIONS.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      
      {/* Units */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>Units *</div>
        <input
          type="number"
          step="0.001"
          placeholder="245.678"
          value={formData.units}
          onChange={e => setFormData(prev => ({ ...prev, units: e.target.value }))}
          style={{ ...inputStyle, width: 100 }}
        />
      </div>
      
      {/* Avg NAV */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>Avg NAV *</div>
        <input
          type="number"
          step="0.01"
          placeholder="62.15"
          value={formData.avgNAV}
          onChange={e => setFormData(prev => ({ ...prev, avgNAV: e.target.value }))}
          style={{ ...inputStyle, width: 90 }}
        />
      </div>
      
      {/* Current NAV */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>Current NAV *</div>
        <input
          type="number"
          step="0.01"
          placeholder="82.45"
          value={formData.currentNAV}
          onChange={e => setFormData(prev => ({ ...prev, currentNAV: e.target.value }))}
          style={{ ...inputStyle, width: 90 }}
        />
      </div>
      
      {/* Entity */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>Entity</div>
        <select
          value={formData.entity}
          onChange={e => setFormData(prev => ({ ...prev, entity: e.target.value }))}
          style={{ ...selectStyle, width: 100 }}
        >
          {ENTITY_OPTIONS.map(entity => (
            <option key={entity} value={entity}>{entity.charAt(0).toUpperCase() + entity.slice(1)}</option>
          ))}
        </select>
      </div>
      
      {/* XIRR */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>XIRR %</div>
        <input
          type="number"
          step="0.1"
          placeholder="18.5"
          value={formData.xirr}
          onChange={e => setFormData(prev => ({ ...prev, xirr: e.target.value }))}
          style={{ ...inputStyle, width: 70 }}
        />
      </div>
      
      {/* Tax Type */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>Tax</div>
        <select
          value={formData.taxType}
          onChange={e => setFormData(prev => ({ ...prev, taxType: e.target.value }))}
          style={{ ...selectStyle, width: 80 }}
        >
          {TAX_TYPE_OPTIONS.map(tax => (
            <option key={tax} value={tax}>{tax}</option>
          ))}
        </select>
      </div>
      
      {/* Buttons */}
      <button 
        onClick={handleSave}
        disabled={saving || !formData.name.trim() || !formData.units || !formData.avgNAV || !formData.currentNAV}
        style={{ 
          padding: '8px 18px', 
          borderRadius: 8, 
          border: 'none', 
          background: saving ? 'var(--text3)' : 'var(--gold)', 
          color: '#000', 
          fontWeight: 700, 
          fontSize: 13, 
          cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.6 : 1,
        }}
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
      
      <button 
        onClick={onClose}
        style={{ 
          padding: '8px 18px', 
          borderRadius: 8, 
          border: '1px solid var(--border)', 
          background: 'transparent', 
          color: 'var(--text2)', 
          fontWeight: 600, 
          fontSize: 13, 
          cursor: 'pointer',
        }}
      >
        Cancel
      </button>
    </div>
  )
}
