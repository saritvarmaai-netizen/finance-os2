export { SettingsRow } from './SettingsRow'
export { Toggle } from './Toggle'
export { ThemeButton } from './ThemeButton'
export { HealthRow } from './HealthRow'

// Shared styles
export const cardStyle: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  padding: 20,
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

export const selectStyle: React.CSSProperties = {
  background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6,
  color: 'var(--text)', fontSize: 12, padding: '6px 12px', outline: 'none', cursor: 'pointer'
}

export const inputStyle: React.CSSProperties = {
  background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6,
  color: 'var(--text)', fontSize: 12, padding: '6px 12px', outline: 'none'
}

export const ghostButtonStyle: React.CSSProperties = {
  background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)', borderRadius: 6,
  padding: '8px 16px', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8,
  cursor: 'pointer', transition: 'all 0.2s'
}

export const greenPillStyle: React.CSSProperties = {
  padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, 
  color: 'var(--green)', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)'
}
