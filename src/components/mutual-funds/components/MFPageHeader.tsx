'use client'

import React from 'react'
import { Plus, FileText, RefreshCw, Sparkles } from 'lucide-react'

interface MFPageHeaderProps {
  // Display info
  holdingsCount: number
  lastUpdated: string | null
  
  // Loading state
  navLoading: boolean
  
  // Callbacks
  onAddFund: () => void
  onImportCAS: () => void
  onRefreshNAV: () => void
  onAIRecommendations: () => void
}

// Styles
const ghostButtonStyle: React.CSSProperties = {
  background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
  padding: '10px 20px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
  cursor: 'pointer', transition: 'all 0.2s'
}

const goldButtonStyle: React.CSSProperties = {
  background: 'var(--gold)', color: 'var(--bg)', border: 'none', borderRadius: 'var(--radius)',
  padding: '10px 20px', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
  cursor: 'pointer', boxShadow: '0 4px 12px rgba(212,175,55,0.2)'
}

export function MFPageHeader({
  holdingsCount,
  lastUpdated,
  navLoading,
  onAddFund,
  onImportCAS,
  onRefreshNAV,
  onAIRecommendations,
}: MFPageHeaderProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
      <div>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
          Mutual Funds
        </h1>
        <div style={{ fontSize: 14, color: 'var(--text2)' }}>
          {holdingsCount} funds · Last NAV:{' '}
          <span style={{ fontWeight: 600, color: lastUpdated ? 'var(--green)' : 'var(--text)' }}>
            {lastUpdated ?? '21 Mar 2026, 9:00 AM (mock)'}
          </span>
          {lastUpdated && (
            <span style={{
              marginLeft: 8, fontSize: 11, padding: '1px 7px', borderRadius: 20,
              background: 'rgba(34,197,94,0.12)', color: 'var(--green)', fontWeight: 600,
            }}>
              ● LIVE
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onAddFund} style={goldButtonStyle}><Plus size={16} /> Add Fund</button>
        <button onClick={onImportCAS} style={ghostButtonStyle}><FileText size={16} /> Import CAS</button>
        <button
          onClick={onRefreshNAV}
          disabled={navLoading}
          style={{
            background: 'transparent',
            color: navLoading ? 'var(--text3)' : 'var(--text2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '10px 20px',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            cursor: navLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: navLoading ? 0.6 : 1,
          }}
        >
          <RefreshCw size={16} style={{
            animation: navLoading ? 'spin 1s linear infinite' : 'none',
          }} />
          {navLoading ? 'Fetching Live NAV...' : 'Refresh NAV'}
        </button>
        <button onClick={onAIRecommendations} style={goldButtonStyle}><Sparkles size={16} /> AI Recommendations</button>
      </div>
    </div>
  )
}
