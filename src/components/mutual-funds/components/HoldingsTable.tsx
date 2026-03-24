'use client'

import React from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { EntityBadge } from '@/components/ui/EntityBadge'
import { useData } from '@/lib/DataContext'
import { formatINR, formatPercent } from '@/lib/format'
import type { MFHolding } from '@/lib/types'

interface HoldingsTableProps {
  onEdit?: (holding: MFHolding) => void
  onDelete?: (id: string, name: string) => void
}

export function HoldingsTable({ onEdit, onDelete }: HoldingsTableProps) {
  const { mfHoldings } = useData()

  if (mfHoldings.length === 0) {
    return null
  }

  return (
    <Card title="Mutual Fund Holdings" noPadding>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase">Fund Name</th>
              <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase text-right">Units</th>
              <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase text-right">Avg NAV</th>
              <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase text-right">Curr NAV</th>
              <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase text-right">Invested</th>
              <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase text-right">Curr Value</th>
              <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase text-right">Gain/Loss</th>
              <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase text-center">XIRR</th>
              <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase text-center">Tax</th>
              <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase text-center">Entity</th>
              {onEdit && onDelete && (
                <th className="px-5 py-3 text-[10px] font-bold text-[var(--text3)] uppercase text-center">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {mfHoldings.map((h) => (
              <tr key={h.id} className="border-b border-[var(--border)] hover:bg-[var(--surface2)] transition-colors group">
                <td className="px-5 py-3">
                  <div>
                    <p className="text-xs font-bold text-[var(--text)]">{h.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-[var(--text3)] uppercase">{h.category}</span>
                      <span className="text-[9px] text-[var(--text3)]">{h.amc}</span>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs font-mono text-right text-[var(--text2)]">{h.units.toFixed(3)}</td>
                <td className="px-5 py-3 text-xs font-mono text-right text-[var(--text2)]">{h.avgNAV.toFixed(2)}</td>
                <td className="px-5 py-3 text-xs font-mono text-right text-[var(--text2)]">{h.currentNAV.toFixed(2)}</td>
                <td className="px-5 py-3 text-xs font-mono text-right text-[var(--text2)]">{formatINR(h.invested, true)}</td>
                <td className="px-5 py-3 text-xs font-mono font-bold text-right text-[var(--text)]">{formatINR(h.currentValue, true)}</td>
                <td className="px-5 py-3 text-right">
                  <p className={`text-xs font-mono font-bold ${h.gain >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                    {formatINR(h.gain, true)}
                  </p>
                  <p className={`text-[10px] font-mono ${h.gainPct >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                    {formatPercent(h.gainPct)}
                  </p>
                </td>
                <td className="px-5 py-3 text-center text-xs font-mono font-bold text-[var(--gold)]">{h.xirr}%</td>
                <td className="px-5 py-3 text-center">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                    h.taxType === 'LTCG' ? 'bg-[var(--green)]/10 text-[var(--green)]' : 'bg-[var(--amber)]/10 text-[var(--amber)]'
                  }`}>
                    {h.taxType}
                  </span>
                </td>
                <td className="px-5 py-3 text-center">
                  <EntityBadge entity={h.entity} />
                </td>
                {onEdit && onDelete && (
                  <td className="px-5 py-3">
                    <div className="flex gap-1 justify-center">
                      <button
                        onClick={() => onEdit(h)}
                        className="p-1.5 rounded border border-[var(--border)] hover:bg-[var(--surface2)] hover:border-[var(--gold)] transition-colors"
                        title="Edit"
                      >
                        <Pencil size={12} className="text-[var(--text2)]" />
                      </button>
                      <button
                        onClick={() => onDelete(h.id, h.name)}
                        className="p-1.5 rounded border border-[var(--border)] hover:bg-[var(--red)]/10 hover:border-[var(--red)] transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={12} className="text-[var(--red)]" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
