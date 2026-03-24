import React, { useState, useEffect, useMemo } from 'react'
import { TabLayout } from '@/components/ui/TabLayout'
import { audit, AuditEntry } from '@/lib/audit'
import { useData } from '@/lib/DataContext'
import { useEntity } from '@/lib/entity-context'
import { fmt } from '@/lib/format'
import { RefreshCw, Trash2, Download, Filter, Activity as ActivityIcon, ArrowUpRight, ArrowDownRight, Building2, TrendingUp, Landmark, Receipt } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

const CATEGORY_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  banking:      { color: 'var(--blue)',     bg: 'rgba(56,189,248,0.12)',  label: 'Banking'      },
  mutual_funds: { color: 'var(--personal)', bg: 'rgba(129,140,248,0.12)', label: 'Mutual Funds' },
  shares:       { color: 'var(--huf)',      bg: 'rgba(52,211,153,0.12)',  label: 'Shares'       },
  income_tax:   { color: 'var(--gold)',     bg: 'rgba(240,165,0,0.12)',   label: 'Income Tax'   },
  settings:     { color: 'var(--text2)',    bg: 'rgba(136,150,174,0.12)', label: 'Settings'     },
  system:       { color: 'var(--amber)',    bg: 'rgba(251,191,36,0.12)',  label: 'System'       },
}

const ACTION_COLORS: Record<string, string> = {
  CREATE:   'var(--green)',
  UPDATE:   'var(--blue)',
  DELETE:   'var(--red)',
  IMPORT:   'var(--personal)',
  RESET:    'var(--amber)',
  AI_CALL:  'var(--gold)',
}

const TRANSACTION_CATEGORIES: Record<string, { color: string; bg: string }> = {
  Salary:     { color: 'var(--green)', bg: 'rgba(34,197,94,0.12)' },
  Investment: { color: 'var(--blue)', bg: 'rgba(56,189,248,0.12)' },
  Dividend:   { color: 'var(--personal)', bg: 'rgba(129,140,248,0.12)' },
  'FD Interest': { color: 'var(--gold)', bg: 'rgba(240,165,0,0.12)' },
  Tax:        { color: 'var(--red)', bg: 'rgba(244,63,94,0.12)' },
  Utilities:  { color: 'var(--text2)', bg: 'rgba(136,150,174,0.12)' },
  Transfer:   { color: 'var(--amber)', bg: 'rgba(251,191,36,0.12)' },
  Other:      { color: 'var(--text3)', bg: 'rgba(100,116,139,0.12)' },
}

export default function ActivityPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [timeFilter, setTimeFilter] = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const [viewMode, setViewMode] = useState<'transactions' | 'audit'>('transactions')

  // Get data from DataContext
  const data = useData()
  const { activeEntities } = useEntity()
  
  // Filter data by active entities
  const filteredTransactions = useMemo(() => {
    return data.transactions.filter(t => activeEntities.includes(t.entity as 'personal' | 'huf' | 'firm'))
  }, [data.transactions, activeEntities])

  const filteredMFHoldings = useMemo(() => {
    return data.mfHoldings.filter(h => activeEntities.includes(h.entity as 'personal' | 'huf' | 'firm'))
  }, [data.mfHoldings, activeEntities])

  const filteredShareHoldings = useMemo(() => {
    return data.shareHoldings.filter(h => activeEntities.includes(h.entity as 'personal' | 'huf' | 'firm'))
  }, [data.shareHoldings, activeEntities])

  const filteredAccounts = useMemo(() => {
    return data.accounts.filter(a => activeEntities.includes(a.entity as 'personal' | 'huf' | 'firm'))
  }, [data.accounts, activeEntities])

  const filteredFDs = useMemo(() => {
    return data.fds.filter(f => activeEntities.includes(f.entity as 'personal' | 'huf' | 'firm'))
  }, [data.fds, activeEntities])

  // Get recent transactions (last 20)
  const recentTransactions = useMemo(() => {
    return [...filteredTransactions]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20)
  }, [filteredTransactions])

  // Activity summary
  const activitySummary = useMemo(() => ({
    totalAccounts: filteredAccounts.length,
    totalMFHoldings: filteredMFHoldings.length,
    totalShareHoldings: filteredShareHoldings.length,
    totalFDs: filteredFDs.length,
    totalTransactions: filteredTransactions.length,
  }), [filteredAccounts, filteredMFHoldings, filteredShareHoldings, filteredFDs, filteredTransactions])

  const load = () => setEntries(audit.getAll())

  useEffect(() => { load() }, [])

  const filtered = entries.filter(e => {
    const catMatch = filter === 'all' || e.category === filter
    const timeMatch = timeFilter === 'all' || (() => {
      const hours = timeFilter === 'today' ? 24 : timeFilter === 'week' ? 168 : 720
      return Date.now() - new Date(e.timestamp).getTime() < hours * 3600000
    })()
    return catMatch && timeMatch
  })

  const handleClear = () => {
    if (!confirmClear) { setConfirmClear(true); return }
    audit.clear()
    setEntries([])
    setConfirmClear(false)
    import('@/lib/audit').then(({ audit }) => {
      audit.log({ action: 'RESET', category: 'system', description: 'Activity log cleared', source: 'manual' })
    })
  }

  const exportCSV = () => {
    const header = 'Timestamp,Action,Category,Description,Impact,Source'
    const rows = filtered.map(e =>
      `"${e.timestamp}","${e.action}","${e.category}","${e.description}","${e.impact ?? ''}","${e.source}"`
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'financeos-activity-log.csv'; a.click()
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: 20,
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  const summaryCardStyle: React.CSSProperties = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: 16,
    display: 'flex', alignItems: 'center', gap: 12,
  }

  return (
    <TabLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            Activity
          </h1>
          <div style={{ fontSize: 14, color: 'var(--text2)' }}>
            {viewMode === 'transactions' 
              ? `${recentTransactions.length} recent transactions` 
              : `${filtered.length} audit events`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {/* View mode toggle */}
          <div style={{ display: 'flex', borderRadius: 9, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <button 
              onClick={() => setViewMode('transactions')}
              style={{ 
                padding: '9px 16px', 
                border: 'none', 
                background: viewMode === 'transactions' ? 'rgba(240,165,0,0.1)' : 'transparent', 
                color: viewMode === 'transactions' ? 'var(--gold)' : 'var(--text2)', 
                fontFamily: 'inherit', 
                fontSize: 13, 
                cursor: 'pointer',
                fontWeight: viewMode === 'transactions' ? 600 : 400,
              }}
            >
              Transactions
            </button>
            <button 
              onClick={() => setViewMode('audit')}
              style={{ 
                padding: '9px 16px', 
                border: 'none', 
                borderLeft: '1px solid var(--border)',
                background: viewMode === 'audit' ? 'rgba(240,165,0,0.1)' : 'transparent', 
                color: viewMode === 'audit' ? 'var(--gold)' : 'var(--text2)', 
                fontFamily: 'inherit', 
                fontSize: 13, 
                cursor: 'pointer',
                fontWeight: viewMode === 'audit' ? 600 : 400,
              }}
            >
              Audit Log
            </button>
          </div>
          <button onClick={load} style={{ padding: '9px 16px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} /> Refresh
          </button>
          {viewMode === 'audit' && (
            <>
              <button onClick={exportCSV} style={{ padding: '9px 16px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Download size={14} /> Export CSV
              </button>
              <button onClick={handleClear} style={{ padding: '9px 16px', borderRadius: 9, border: `1px solid ${confirmClear ? 'var(--red)' : 'var(--border)'}`, background: confirmClear ? 'rgba(244,63,94,0.1)' : 'transparent', color: confirmClear ? 'var(--red)' : 'var(--text2)', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Trash2 size={14} /> {confirmClear ? 'Confirm Clear' : 'Clear Log'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 24 }}>
        <div style={summaryCardStyle}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(56,189,248,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={20} style={{ color: 'var(--blue)' }} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: '"Playfair Display", serif', color: 'var(--text)' }}>{activitySummary.totalAccounts}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>Bank Accounts</div>
          </div>
        </div>
        <div style={summaryCardStyle}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(129,140,248,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={20} style={{ color: 'var(--personal)' }} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: '"Playfair Display", serif', color: 'var(--text)' }}>{activitySummary.totalMFHoldings}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>MF Holdings</div>
          </div>
        </div>
        <div style={summaryCardStyle}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(52,211,153,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={20} style={{ color: 'var(--huf)' }} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: '"Playfair Display", serif', color: 'var(--text)' }}>{activitySummary.totalShareHoldings}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>Share Holdings</div>
          </div>
        </div>
        <div style={summaryCardStyle}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(240,165,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Landmark size={20} style={{ color: 'var(--gold)' }} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: '"Playfair Display", serif', color: 'var(--text)' }}>{activitySummary.totalFDs}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>Fixed Deposits</div>
          </div>
        </div>
        <div style={summaryCardStyle}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(136,150,174,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Receipt size={20} style={{ color: 'var(--text2)' }} />
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: '"Playfair Display", serif', color: 'var(--text)' }}>{activitySummary.totalTransactions}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>Transactions</div>
          </div>
        </div>
      </div>

      {viewMode === 'transactions' ? (
        /* Transactions View */
        <div style={cardStyle}>
          {recentTransactions.length === 0 ? (
            <EmptyState
              icon={ActivityIcon}
              title="No recent transactions"
              description="Transactions you add will appear here. Go to Banking to add your first transaction."
            />
          ) : (
            <div style={{ maxHeight: 500, overflowY: 'auto' }}>
              {recentTransactions.map((tx, i) => {
                const isCredit = tx.credit > 0
                const catConfig = TRANSACTION_CATEGORIES[tx.category] || TRANSACTION_CATEGORIES.Other
                return (
                  <div key={tx.id}
                    style={{ 
                      padding: '14px 0', 
                      borderBottom: i < recentTransactions.length - 1 ? '1px solid var(--border)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                    }}
                  >
                    {/* Icon */}
                    <div style={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: 8, 
                      background: isCredit ? 'rgba(34,197,94,0.12)' : 'rgba(244,63,94,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {isCredit ? (
                        <ArrowDownRight size={18} style={{ color: 'var(--green)' }} />
                      ) : (
                        <ArrowUpRight size={18} style={{ color: 'var(--red)' }} />
                      )}
                    </div>
                    
                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tx.description}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 700, color: catConfig.color, background: catConfig.bg }}>
                          {tx.category}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text3)' }}>{tx.account}</span>
                        <span style={{ 
                          padding: '2px 6px', 
                          borderRadius: 4, 
                          fontSize: 9, 
                          fontWeight: 600, 
                          color: tx.entity === 'personal' ? 'var(--personal)' : tx.entity === 'huf' ? 'var(--huf)' : 'var(--firm)',
                          background: tx.entity === 'personal' ? 'rgba(129,140,248,0.12)' : tx.entity === 'huf' ? 'rgba(52,211,153,0.12)' : 'rgba(251,191,36,0.12)',
                          textTransform: 'capitalize',
                        }}>
                          {tx.entity}
                        </span>
                      </div>
                    </div>
                    
                    {/* Amount & Date */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ 
                        fontSize: 14, 
                        fontWeight: 600, 
                        color: isCredit ? 'var(--green)' : 'var(--red)',
                      }}>
                        {isCredit ? '+' : '-'}{fmt(isCredit ? tx.credit : tx.debit)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{tx.date}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        /* Audit Log View */
        <>
          {/* Audit category summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12, marginBottom: 24 }}>
            {Object.entries(CATEGORY_COLORS).map(([key, cfg]) => {
              const count = entries.filter(e => e.category === key).length
              return (
                <div key={key} onClick={() => setFilter(filter === key ? 'all' : key)}
                  style={{ ...cardStyle, textAlign: 'center', cursor: 'pointer', borderColor: filter === key ? cfg.color : 'var(--border)' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: '"Playfair Display", serif', color: filter === key ? cfg.color : 'var(--text)' }}>{count}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text2)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{cfg.label}</div>
                </div>
              )
            })}
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 24 }}>
            <Filter size={14} style={{ color: 'var(--text3)' }} />
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>Time:</span>
            {[['all','All Time'],['today','Today'],['week','This Week'],['month','This Month']].map(([val, label]) => (
              <button key={val} onClick={() => setTimeFilter(val)}
                style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: '1px solid', borderColor: timeFilter === val ? 'var(--gold)' : 'var(--border)', background: timeFilter === val ? 'rgba(240,165,0,0.1)' : 'transparent', color: timeFilter === val ? 'var(--gold)' : 'var(--text2)' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Log entries */}
          <div style={cardStyle}>
            {filtered.length === 0 ? (
              <EmptyState
                icon={ActivityIcon}
                title="No recent activity"
                description="Changes you make to your accounts, investments, or settings will appear here."
              />
            ) : (
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {filtered.map((entry, i) => {
                  const cc = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.system
                  const ac = ACTION_COLORS[entry.action] ?? 'var(--text2)'
                  const isExpanded = expanded === entry.id
                  const hasDetails = entry.before || entry.after
                  return (
                    <div key={entry.id}
                      style={{ padding: '14px 0', borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', cursor: hasDetails ? 'pointer' : 'default' }}
                      onClick={() => hasDetails && setExpanded(isExpanded ? null : entry.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                        {/* Action badge */}
                        <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 800, color: ac, background: `${ac}20`, letterSpacing: '0.5px', flexShrink: 0, marginTop: 2 }}>
                          {entry.action}
                        </span>
                        {/* Category badge */}
                        <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 700, color: cc.color, background: cc.bg, flexShrink: 0, marginTop: 2 }}>
                          {cc.label}
                        </span>
                        {/* Content */}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: entry.impact ? 4 : 0 }}>
                            {entry.description}
                          </div>
                          {entry.impact && (
                            <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 500 }}>{entry.impact}</div>
                          )}
                          {isExpanded && hasDetails && (
                            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                              {entry.before && (
                                <div style={{ padding: '8px 12px', background: 'rgba(244,63,94,0.06)', borderRadius: 6, border: '1px solid rgba(244,63,94,0.15)' }}>
                                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--red)', marginBottom: 6 }}>BEFORE</div>
                                  {Object.entries(entry.before).map(([k,v]) => (
                                    <div key={k} style={{ fontSize: 12, color: 'var(--text2)' }}>{k}: <span style={{ fontFamily: '"JetBrains Mono",monospace', color: 'var(--text)' }}>{String(v)}</span></div>
                                  ))}
                                </div>
                              )}
                              {entry.after && (
                                <div style={{ padding: '8px 12px', background: 'rgba(34,197,94,0.06)', borderRadius: 6, border: '1px solid rgba(34,197,94,0.15)' }}>
                                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', marginBottom: 6 }}>AFTER</div>
                                  {Object.entries(entry.after).map(([k,v]) => (
                                    <div key={k} style={{ fontSize: 12, color: 'var(--text2)' }}>{k}: <span style={{ fontFamily: '"JetBrains Mono",monospace', color: 'var(--text)' }}>{String(v)}</span></div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {/* Right side */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{entry.timestamp}</div>
                          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>{entry.source}</div>
                          {hasDetails && <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>{isExpanded ? '▲ hide' : '▼ details'}</div>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </TabLayout>
  )
}
