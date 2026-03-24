'use client'

import React, { useState } from 'react'
import { EntityBadge } from '@/components/ui/EntityBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { useData, ShareHoldingComputed } from '@/lib/DataContext'
import { fmt } from '@/lib/utils'
import { Pencil, Trash2 } from 'lucide-react'

interface SharesHoldingsTableProps {
  holdings: ShareHoldingComputed[]
  onEdit: (holding: ShareHoldingComputed) => void
}

export function SharesHoldingsTable({ holdings, onEdit }: SharesHoldingsTableProps) {
  const { deleteShareHolding } = useData()
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean
    holding: ShareHoldingComputed | null
  }>({ open: false, holding: null })

  const handleDelete = async () => {
    if (deleteConfirm.holding) {
      await deleteShareHolding(deleteConfirm.holding.id)
    }
    setDeleteConfirm({ open: false, holding: null })
  }

  const confirmDelete = (holding: ShareHoldingComputed) => {
    setDeleteConfirm({ open: true, holding })
  }

  return (
    <>
      <div style={{ ...cardStyle, padding: 0 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SectionLabel>Portfolio Holdings</SectionLabel>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Symbol</th>
                <th style={tableHeaderStyle}>Company</th>
                <th style={tableHeaderStyle}>Sector</th>
                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Qty</th>
                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Avg Price</th>
                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>CMP</th>
                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Invested</th>
                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Current</th>
                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Gain</th>
                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Gain %</th>
                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Div FY</th>
                <th style={tableHeaderStyle}>Entity</th>
                <th style={{ ...tableHeaderStyle, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr 
                  key={h.id}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.025)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  style={{ transition: 'background 0.15s' }}
                >
                  <td style={{ ...tableCellStyle, fontWeight: 700, color: 'var(--text)' }}>{h.symbol}</td>
                  <td style={tableCellStyle}>{h.company}</td>
                  <td style={tableCellStyle}>{h.sector}</td>
                  <td style={{ ...tableCellStyle, textAlign: 'right' }}>{h.qty}</td>
                  <td style={{ ...tableCellStyle, textAlign: 'right', fontFamily: '"JetBrains Mono", monospace' }}>{fmt(h.avgPrice)}</td>
                  <td style={{ ...tableCellStyle, textAlign: 'right', fontFamily: '"JetBrains Mono", monospace', fontWeight: 700 }}>{fmt(h.cmp)}</td>
                  <td style={{ ...tableCellStyle, textAlign: 'right', fontFamily: '"JetBrains Mono", monospace' }}>{fmt(h.invested)}</td>
                  <td style={{ ...tableCellStyle, textAlign: 'right', fontFamily: '"JetBrains Mono", monospace' }}>{fmt(h.currentValue)}</td>
                  <td style={{ ...tableCellStyle, textAlign: 'right', fontFamily: '"JetBrains Mono", monospace', color: h.gain >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {fmt(h.gain)}
                  </td>
                  <td style={{ ...tableCellStyle, textAlign: 'right', fontFamily: '"JetBrains Mono", monospace', color: h.gainPct >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {h.gainPct.toFixed(2)}%
                  </td>
                  <td style={{ ...tableCellStyle, textAlign: 'right', fontFamily: '"JetBrains Mono", monospace' }}>{fmt(h.dividendFY)}</td>
                  <td style={tableCellStyle}><EntityBadge entity={h.entity} /></td>
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <button
                        onClick={() => onEdit(h)}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--border)',
                          borderRadius: 4,
                          padding: '4px 8px',
                          fontSize: 11,
                          fontWeight: 600,
                          color: 'var(--text2)',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--surface2)'
                          e.currentTarget.style.color = 'var(--text)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                          e.currentTarget.style.color = 'var(--text2)'
                        }}
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(h)}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: 4,
                          padding: '4px 8px',
                          fontSize: 11,
                          fontWeight: 600,
                          color: 'var(--red)',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                        }}
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, holding: open ? deleteConfirm.holding : null })}
        title="Delete Share Holding"
        description={`Are you sure you want to delete ${deleteConfirm.holding?.symbol}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  )
}

const cardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}



const tableHeaderStyle: React.CSSProperties = {
  padding: '10px 16px', textAlign: 'left',
  fontSize: 10, fontWeight: 600, letterSpacing: '0.8px',
  textTransform: 'uppercase', color: 'var(--text2)',
  borderBottom: '1px solid var(--border)',
  background: 'var(--surface2)', whiteSpace: 'nowrap',
}

const tableCellStyle: React.CSSProperties = {
  padding: '12px 16px', fontSize: 13, color: 'var(--text2)',
  borderBottom: '1px solid var(--border)',
}
