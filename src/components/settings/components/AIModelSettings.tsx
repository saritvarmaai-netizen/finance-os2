'use client'

import React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { SettingsRow, cardStyle, selectStyle, inputStyle } from './ui'

interface AIModelSettingsProps {
  aiMode: 'basic' | 'intelligent'
  setAiMode: (v: 'basic' | 'intelligent') => void
  aiProvider: string
  setAiProvider: (v: string) => void
  aiModel: string
  setAiModel: (v: string) => void
  apiKey: string
  setApiKey: (v: string) => void
  showApiKey: boolean
  setShowApiKey: (v: boolean) => void
  responseDetail: string
  setResponseDetail: (v: string) => void
}

export function AIModelSettings({
  aiMode, setAiMode, aiProvider, setAiProvider, aiModel, setAiModel,
  apiKey, setApiKey, showApiKey, setShowApiKey, responseDetail, setResponseDetail
}: AIModelSettingsProps) {
  return (
    <div style={cardStyle}>
      <SectionLabel>AI Model</SectionLabel>
      <SettingsRow 
        label="AI Mode" 
        desc={aiMode === 'basic' ? 'Direct API calls — works with any free key' : 'Skills-powered — more accurate and context-aware'} 
        isLast={false}
      >
        <div style={{ display: 'flex', gap: 0, background: 'var(--surface2)', padding: 3, borderRadius: 8, border: '1px solid var(--border)' }}>
          {(['basic', 'intelligent'] as const).map(m => (
            <button key={m} onClick={() => setAiMode(m)} style={{
              padding: '6px 14px', borderRadius: 6, fontSize: 11, fontWeight: 700,
              cursor: 'pointer', border: 'none', transition: 'all 0.2s',
              background: aiMode === m ? (m === 'intelligent' ? 'var(--gold)' : 'var(--surface3)') : 'transparent',
              color: aiMode === m ? (m === 'intelligent' ? '#000' : 'var(--text)') : 'var(--text3)',
            }}>
              {m === 'basic' ? '⚡ Basic' : '🧠 Intelligent'}
            </button>
          ))}
        </div>
      </SettingsRow>
      <SettingsRow label="AI Provider" desc="Currently: Google Gemini" isLast={false}>
        <select style={selectStyle} value={aiProvider} onChange={e => setAiProvider(e.target.value)}>
          <option>Google Gemini</option>
          <option>Anthropic Claude</option>
          <option>Ollama (Local)</option>
        </select>
      </SettingsRow>
      <SettingsRow label="Model" isLast={false}>
        <select style={selectStyle} value={aiModel} onChange={e => setAiModel(e.target.value)}>
          <option>Gemini 2.0 Flash</option>
          <option>Gemini Pro 3.1</option>
          <option>claude-sonnet-4-6</option>
        </select>
      </SettingsRow>
      <SettingsRow label="API Key" isLast={false}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <input 
              type={showApiKey ? "text" : "password"} 
              value={apiKey} 
              onChange={e => setApiKey(e.target.value)}
              placeholder="Enter API Key"
              style={{ ...inputStyle, width: 180, paddingRight: 36 }} 
            />
            <button 
              onClick={() => setShowApiKey(!showApiKey)}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer' }}
            >
              {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <button style={{ 
            background: 'rgba(16,185,129,0.1)', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.2)', 
            borderRadius: 6, padding: '0 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' 
          }}>
            Test ✓
          </button>
        </div>
      </SettingsRow>
      <SettingsRow label="Response Detail" isLast={true}>
        <select style={selectStyle} value={responseDetail} onChange={e => setResponseDetail(e.target.value)}>
          <option>Detailed</option>
          <option>Concise</option>
        </select>
      </SettingsRow>
    </div>
  )
}
