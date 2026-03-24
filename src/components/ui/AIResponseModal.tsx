import React from 'react'
import { X, Eye, Sparkles } from 'lucide-react'

interface AIResponseModalProps {
  isOpen: boolean
  onClose: () => void
  loading: boolean
  response: string
  sanitisedPreview: string
  mode: 'basic' | 'intelligent'
  error?: string
  question: string
}

export function AIResponseModal({
  isOpen, onClose, loading, response, sanitisedPreview, mode, error, question
}: AIResponseModalProps) {
  const [showPreview, setShowPreview] = React.useState(false)
  if (!isOpen) return null

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300 }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 600, maxHeight: '80vh',
        background: 'var(--surface)', border: '1px solid var(--border2)',
        borderRadius: 'var(--radius)', zIndex: 301,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={16} style={{ color: 'var(--gold)' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>AI Analysis</span>
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
              background: mode === 'intelligent' ? 'rgba(240,165,0,0.15)' : 'rgba(56,189,248,0.15)',
              color: mode === 'intelligent' ? 'var(--gold)' : 'var(--blue)',
            }}>
              {mode.toUpperCase()} MODE
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        {/* Question */}
        <div style={{ padding: '12px 20px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>QUESTION</div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>{question}</div>
        </div>

        {/* Response */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text2)' }}>
              <div style={{ fontSize: 24, marginBottom: 12, animation: 'spin 2s linear infinite', display: 'inline-block' }}>⚙</div>
              <div style={{ fontSize: 14 }}>Analysing your portfolio...</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>Personal data has been anonymised before sending</div>
            </div>
          ) : error ? (
            <div style={{ padding: '14px', background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 8, color: 'var(--red)', fontSize: 13 }}>
              ✗ {error}
            </div>
          ) : (
            <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {response}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text3)', fontSize: 11, cursor: 'pointer' }}
          >
            <Eye size={12} /> {showPreview ? 'Hide' : 'What was sent to AI?'}
          </button>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>🔒 Personal identifiers removed before sending</div>
        </div>

        {showPreview && (
          <div style={{ padding: '0 20px 16px', maxHeight: 200, overflowY: 'auto' }}>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 6, fontWeight: 700 }}>DATA SENT TO AI (anonymised):</div>
            <pre style={{ fontSize: 10, color: 'var(--text2)', background: 'var(--surface2)', padding: '10px', borderRadius: 6, overflow: 'auto', margin: 0, lineHeight: 1.4 }}>
              {sanitisedPreview}
            </pre>
          </div>
        )}
      </div>
    </>
  )
}
