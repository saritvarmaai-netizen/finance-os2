'use client'

import React from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EntityBadge } from '@/components/ui/EntityBadge'
import type { MFHoldingComputed } from '@/lib/types'

interface MFHoldingsSectionProps {
  holdings: MFHoldingComputed[]
  liveNAV: Record<string, number>
  onEdit: (holding: MFHoldingComputed) => void
  onDelete: (id: string, name: string) => void
  formatFn: (val: number) => string
}

export function MFHoldingsSection({ 
  holdings, 
  liveNAV, 
  onEdit, 
  onDelete,
  formatFn 
}: MFHoldingsSectionProps) {
  
  const getLiveData = (h: MFHoldingComputed) => {
    const currentNAV = liveNAV[h.name] ?? h.currentNAV
    const currentValue = Math.round(currentNAV * h.units)
    const gain = currentValue - h.invested
    const gainPct = ((gain / h.invested) * 100)
    return { currentNAV, currentValue, gain, gainPct }
  }

  return (
    <Card className="p-0 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[var(--surface2)] hover:bg-[var(--surface2)]">
            <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text2)]">Fund</TableHead>
            <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text2)] text-right">Units</TableHead>
            <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text2)] text-right">NAV</TableHead>
            <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text2)] text-right">Value</TableHead>
            <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text2)] text-right">Gain</TableHead>
            <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text2)] text-right">XIRR</TableHead>
            <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text2)]">Tax</TableHead>
            <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text2)]">Entity</TableHead>
            <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-[var(--text2)] text-center w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holdings.map((h, i) => {
            const live = getLiveData(h)
            return (
              <TableRow 
                key={h.id || i}
                className="cursor-pointer"
              >
                <TableCell className="text-[13px] text-[var(--text2)]">
                  <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{h.name}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ 
                      padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700, 
                      color: 'var(--blue)', background: 'rgba(59,130,246,0.1)' 
                    }}>{h.category}</span>
                    <span style={{ fontSize: 10, color: 'var(--text3)' }}>{h.amc}</span>
                  </div>
                </TableCell>
                <TableCell className="text-[13px] text-[var(--text2)] text-right font-mono">{h.units.toFixed(3)}</TableCell>
                <TableCell className="text-[13px] text-[var(--text2)] text-right font-mono">
                  {liveNAV[h.name] 
                    ? <span style={{ color: 'var(--green)', fontWeight: 700 }}>
                        ₹{live.currentNAV.toFixed(2)}
                      </span>
                    : <span>₹{h.currentNAV.toFixed(2)}</span>
                  }
                  {liveNAV[h.name] && (
                    <div style={{ fontSize: 9, color: 'var(--green)', fontWeight: 700, marginTop: 2 }}>
                      ● LIVE
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-[13px] text-[var(--text2)] text-right font-mono font-semibold">{formatFn(live.currentValue)}</TableCell>
                <TableCell className="text-[13px] text-[var(--text2)] text-right">
                  <div style={{ color: live.gain >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700, fontFamily: '"JetBrains Mono", monospace' }}>
                    {live.gain >= 0 ? '+' : ''}{formatFn(live.gain)}
                  </div>
                  <div style={{ color: live.gain >= 0 ? 'var(--green)' : 'var(--red)', fontSize: 11, fontWeight: 500 }}>
                    {live.gain >= 0 ? '+' : ''}{live.gainPct.toFixed(1)}%
                  </div>
                </TableCell>
                <TableCell className="text-[13px] text-right font-mono font-semibold" style={{ color: h.xirr >= 0 ? 'var(--green)' : 'var(--red)' }}>{h.xirr}%</TableCell>
                <TableCell className="text-[13px] text-[var(--text2)]">
                  <span style={{ 
                    padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700, 
                    color: h.taxType === 'LTCG' ? 'var(--green)' : 'var(--amber)',
                    background: h.taxType === 'LTCG' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)'
                  }}>{h.taxType}</span>
                </TableCell>
                <TableCell className="text-[13px] text-[var(--text2)]"><EntityBadge entity={h.entity} /></TableCell>
                <TableCell className="text-[13px] text-[var(--text2)]">
                  <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                    <button
                      onClick={() => onEdit(h)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        borderRadius: 4,
                        padding: '4px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--surface2)'
                        e.currentTarget.style.borderColor = 'var(--gold)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.borderColor = 'var(--border)'
                      }}
                      title="Edit holding"
                    >
                      <Pencil size={12} color="var(--text2)" />
                    </button>
                    <button
                      onClick={() => onDelete(h.id, h.name)}
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        borderRadius: 4,
                        padding: '4px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.1)'
                        e.currentTarget.style.borderColor = 'var(--red)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.borderColor = 'var(--border)'
                      }}
                      title="Delete holding"
                    >
                      <Trash2 size={12} color="var(--red)" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
