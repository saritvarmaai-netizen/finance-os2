'use client'

import React from 'react'
import { FileSpreadsheet, FileText } from 'lucide-react'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { SettingsRow, cardStyle, selectStyle } from './ui'

interface ExportSettingsProps {
  exportType: string
  setExportType: (v: string) => void
  exportDateRange: string
  setExportDateRange: (v: string) => void
  entityFilter: string
  setEntityFilter: (v: string) => void
}

export function ExportSettings({
  exportType, setExportType, exportDateRange, setExportDateRange, entityFilter, setEntityFilter
}: ExportSettingsProps) {
  return (
    <div style={cardStyle}>
      <SectionLabel>Export Data</SectionLabel>
      <SettingsRow label="Export Type" isLast={false}>
        <select style={selectStyle} value={exportType} onChange={e => setExportType(e.target.value)}>
          <option>All Data</option>
          <option>Transactions Only</option>
          <option>Holdings Only</option>
        </select>
      </SettingsRow>
      <SettingsRow label="Date Range" isLast={false}>
        <select style={selectStyle} value={exportDateRange} onChange={e => setExportDateRange(e.target.value)}>
          <option>FY 2025-26</option>
          <option>FY 2024-25</option>
          <option>Custom Range</option>
        </select>
      </SettingsRow>
      <SettingsRow label="Entity Filter" isLast={false}>
        <select style={selectStyle} value={entityFilter} onChange={e => setEntityFilter(e.target.value)}>
          <option>All Entities</option>
          <option>Self Only</option>
          <option>HUF Only</option>
          <option>Firm Only</option>
        </select>
      </SettingsRow>
      <SettingsRow label="Format" isLast={true}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ 
            background: 'rgba(16,185,129,0.1)', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.2)', 
            borderRadius: 6, padding: '8px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <FileSpreadsheet size={14} /> Excel
          </button>
          <button style={{ 
            background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)', 
            borderRadius: 6, padding: '8px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <FileText size={14} /> PDF
          </button>
        </div>
      </SettingsRow>
      <button style={{
        width: '100%', marginTop: 16, padding: '12px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
        background: 'var(--gold)', color: 'var(--bg)', border: 'none',
        boxShadow: '0 4px 20px rgba(212,175,55,0.3)'
      }}>
        Generate Export
      </button>
    </div>
  )
}
