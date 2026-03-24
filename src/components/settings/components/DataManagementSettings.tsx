'use client'

import React, { useRef } from 'react'
import { Download, Upload, Play } from 'lucide-react'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { SettingsRow, Toggle, cardStyle } from './ui'

interface DataManagementSettingsProps {
  demoMode: boolean
  onToggleDemoMode: () => void
  isExporting: boolean
  onExport: () => void
  isImporting: boolean
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void
  onResetToDemo: () => void
  deleteConfirm: string | null
  onDelete: (type: 'transactions' | 'mf' | 'shares' | 'all') => void
  deleteStatus: string | null
}

export function DataManagementSettings({
  demoMode, onToggleDemoMode, isExporting, onExport, isImporting, onImport,
  onResetToDemo, deleteConfirm, onDelete, deleteStatus
}: DataManagementSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const deleteItems = [
    { key: 'transactions' as const, label: 'Delete All Transactions', desc: 'Removes all banking transaction history' },
    { key: 'mf' as const, label: 'Delete MF Holdings', desc: 'Removes all mutual fund holdings data' },
    { key: 'shares' as const, label: 'Delete Share Holdings', desc: 'Removes all direct equity data' },
  ]

  return (
    <div style={cardStyle}>
      <SectionLabel>Data Management</SectionLabel>
      
      {/* Demo Mode Toggle */}
      <SettingsRow label="Demo Mode" desc="Show sample data to explore the app" isLast={false}>
        <Toggle on={demoMode} onClick={onToggleDemoMode} />
      </SettingsRow>
      
      {/* Export/Import Buttons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 16, marginBottom: 16 }}>
        <button
          onClick={onExport}
          disabled={isExporting}
          style={{
            flex: 1, padding: '10px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700,
            cursor: isExporting ? 'wait' : 'pointer',
            background: 'var(--gold)', color: 'var(--bg)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: isExporting ? 0.7 : 1,
          }}
        >
          <Download size={14} /> {isExporting ? 'Exporting...' : 'Export Data'}
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          style={{
            flex: 1, padding: '10px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700,
            cursor: isImporting ? 'wait' : 'pointer',
            background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: isImporting ? 0.7 : 1,
          }}
        >
          <Upload size={14} /> {isImporting ? 'Importing...' : 'Import Data'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={onImport}
          style={{ display: 'none' }}
        />
      </div>
      
      {/* Reset to Demo */}
      <button
        onClick={onResetToDemo}
        style={{
          width: '100%', padding: '10px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700,
          cursor: 'pointer',
          background: 'rgba(212,175,55,0.1)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
      >
        <Play size={14} /> Reset to Demo Data
      </button>

      {deleteStatus && (
        <div style={{
          padding: '10px 14px', borderRadius: 8, marginTop: 16,
          background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
          color: 'var(--green)', fontSize: 12, fontWeight: 600,
        }}>
          ✓ {deleteStatus}
        </div>
      )}

      <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12, fontWeight: 600, letterSpacing: '0.5px' }}>
          DELETE SPECIFIC DATA
        </div>
        
        {deleteItems.map(item => (
          <div key={item.key} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 0', borderBottom: '1px solid var(--border)',
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{item.desc}</div>
            </div>
            <button
              onClick={() => onDelete(item.key)}
              style={{
                padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.2s',
                background: deleteConfirm === item.key ? 'rgba(244,63,94,0.15)' : 'transparent',
                color: deleteConfirm === item.key ? 'var(--red)' : 'var(--text2)',
                border: `1px solid ${deleteConfirm === item.key ? 'var(--red)' : 'var(--border)'}`,
              }}
            >
              {deleteConfirm === item.key ? '⚠ Confirm?' : 'Delete'}
            </button>
          </div>
        ))}
      </div>

      <div style={{ paddingTop: 16 }}>
        <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10, fontWeight: 600, letterSpacing: '0.5px' }}>
          ⚠ DANGER ZONE
        </div>
        <button
          onClick={() => onDelete('all')}
          style={{
            width: '100%', padding: 10, borderRadius: 8, fontSize: 13, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s',
            background: deleteConfirm === 'all' ? 'var(--red)' : 'transparent',
            color: deleteConfirm === 'all' ? '#fff' : 'var(--red)',
            border: '1px solid var(--red)',
          }}
        >
          {deleteConfirm === 'all' ? '⚠ Click again — deletes EVERYTHING' : 'Delete All App Data'}
        </button>
      </div>
    </div>
  )
}
