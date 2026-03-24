import React from 'react'
import { AlertTriangle, Clock, Lightbulb, Info, X, Bell } from 'lucide-react'

const NOTIFICATIONS = [
  {
    id: 1, type: 'warning',
    title: 'Advance Tax Due in 8 Days',
    msg: '₹78,500 estimated for Self — Q4 installment. Pay before 15 March to avoid 234B interest.',
    time: '2 hours ago', priority: 'HIGH',
  },
  {
    id: 2, type: 'reminder',
    title: 'IDFC Child FD Maturing Apr 3',
    msg: '₹5,00,000 FD matures in 13 days. Decide: auto-renew at 7.25% or redeploy to liquid fund?',
    time: 'Yesterday', priority: 'MEDIUM',
  },
  {
    id: 3, type: 'opportunity',
    title: 'LTCG Harvest Opportunity',
    msg: '₹82,000 exemption remaining this FY. Sell 62.5 units of PPFCF before Mar 31 → save ₹9,813 in tax.',
    time: '2 days ago', priority: 'OPPORTUNITY',
  },
  {
    id: 4, type: 'info',
    title: 'NAV Prices Updated',
    msg: 'Mutual fund NAV refreshed from MFAPI. Portfolio up ₹18,240 today.',
    time: '3 days ago', priority: 'INFO',
  },
  {
    id: 5, type: 'info',
    title: 'Infosys Dividend Credited',
    msg: '₹3,200 credited to SBI Savings Account. This is fully taxable as income.',
    time: '5 days ago', priority: 'INFO',
  },
]

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  warning:     { icon: <AlertTriangle size={15} />, color: 'var(--red)',   bg: 'rgba(244,63,94,0.12)'   },
  reminder:    { icon: <Clock size={15} />,         color: 'var(--amber)', bg: 'rgba(251,191,36,0.12)'  },
  opportunity: { icon: <Lightbulb size={15} />,     color: 'var(--gold)',  bg: 'rgba(240,165,0,0.12)'   },
  info:        { icon: <Info size={15} />,           color: 'var(--blue)',  bg: 'rgba(56,189,248,0.12)'  },
}

const PRIORITY_CONFIG: Record<string, { color: string; bg: string }> = {
  HIGH:        { color: 'var(--red)',   bg: 'rgba(244,63,94,0.15)'  },
  MEDIUM:      { color: 'var(--amber)', bg: 'rgba(251,191,36,0.15)' },
  OPPORTUNITY: { color: 'var(--green)', bg: 'rgba(34,197,94,0.15)'  },
  INFO:        { color: 'var(--blue)',  bg: 'rgba(56,189,248,0.15)' },
}

export function NotificationPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 198 }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed',
        top: 68,
        right: 20,
        width: 380,
        maxHeight: 'calc(100vh - 90px)',  /* key: fills available height but never goes off screen */
        background: 'var(--surface)',
        border: '1px solid var(--border2)',
        borderRadius: 'var(--radius)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        zIndex: 199,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',              /* panel itself clips */
      }}>

        {/* Sticky header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--surface)',
          flexShrink: 0,                 /* header never shrinks */
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bell size={14} style={{ color: 'var(--text2)' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Notifications</span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20,
              background: 'rgba(244,63,94,0.15)', color: 'var(--red)',
            }}>
              {NOTIFICATIONS.length}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button style={{
              background: 'none', border: 'none', fontSize: 11, fontWeight: 600,
              color: 'var(--gold)', cursor: 'pointer',
            }}>
              Mark all read
            </button>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', display: 'flex' }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Scrollable notification list */}
        <div style={{
          overflowY: 'auto',             /* THIS is what makes it scroll */
          flex: 1,                       /* takes remaining height */
        }}>
          {NOTIFICATIONS.map((n, i) => {
            const tc = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.info
            const pc = PRIORITY_CONFIG[n.priority] ?? PRIORITY_CONFIG.INFO
            return (
              <div
                key={n.id}
                style={{
                  padding: '14px 18px',
                  borderBottom: i < NOTIFICATIONS.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', gap: 12 }}>
                  {/* Icon */}
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: tc.bg, color: tc.color,
                  }}>
                    {tc.icon}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: 10, color: 'var(--text3)', flexShrink: 0, marginLeft: 8 }}>
                        {n.time}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.55, margin: '0 0 8px' }}>
                      {n.msg}
                    </p>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 20,
                      color: pc.color, background: pc.bg, letterSpacing: '0.5px',
                    }}>
                      {n.priority}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Sticky footer */}
        <div style={{
          padding: '10px 18px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)',
          flexShrink: 0,
        }}>
          <button style={{
            width: '100%', background: 'none', border: 'none',
            fontSize: 11, fontWeight: 600, color: 'var(--text2)', cursor: 'pointer',
            textAlign: 'center',
          }}>
            View all notifications
          </button>
        </div>
      </div>
    </>
  )
}
