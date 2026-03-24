'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Plus } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 32px',
      textAlign: 'center',
    }}>
      {/* Large Icon */}
      <div style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
      }}>
        <Icon size={36} color="var(--text3)" strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: 18,
        fontWeight: 700,
        color: 'var(--text)',
        fontFamily: '"Playfair Display", serif',
        marginBottom: 8,
      }}>
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p style={{
          fontSize: 14,
          color: 'var(--text2)',
          maxWidth: 320,
          lineHeight: 1.6,
          marginBottom: actionLabel ? 24 : 0,
        }}>
          {description}
        </p>
      )}

      {/* Action Button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--gold)',
            color: 'var(--bg)',
            border: 'none',
            borderRadius: 'var(--radius)',
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(212,175,55,0.2)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(212,175,55,0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(212,175,55,0.2)'
          }}
        >
          <Plus size={18} />
          {actionLabel}
        </button>
      )}
    </div>
  )
}

// Specialized empty state for welcome/dashboard
export function WelcomeEmptyState({ onGetStarted }: { onGetStarted?: () => void }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 32px',
      textAlign: 'center',
    }}>
      {/* Logo Icon */}
      <div style={{
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))',
        border: '2px solid var(--gold)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
      }}>
        <span style={{ fontSize: 48 }}>💰</span>
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: 32,
        fontWeight: 700,
        color: 'var(--text)',
        fontFamily: '"Playfair Display", serif',
        marginBottom: 12,
      }}>
        Welcome to FinanceOS
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: 16,
        color: 'var(--text2)',
        maxWidth: 400,
        lineHeight: 1.6,
        marginBottom: 40,
      }}>
        Your personal finance command centre. Track investments, manage taxes, and grow your wealth.
      </p>

      {/* Getting Started Tips */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        maxWidth: 600,
        marginBottom: 40,
      }}>
        <TipCard
          icon="🏦"
          title="Add Bank Accounts"
          description="Connect your savings and current accounts"
        />
        <TipCard
          icon="📈"
          title="Track Investments"
          description="Monitor your mutual funds and stocks"
        />
        <TipCard
          icon="📊"
          title="Plan Taxes"
          description="Optimize your tax strategy"
        />
      </div>

      {/* Get Started Button */}
      {onGetStarted && (
        <button
          onClick={onGetStarted}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--gold)',
            color: 'var(--bg)',
            border: 'none',
            borderRadius: 'var(--radius)',
            padding: '14px 32px',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(212,175,55,0.2)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(212,175,55,0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(212,175,55,0.2)'
          }}
        >
          Get Started
        </button>
      )}
    </div>
  )
}

function TipCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: 20,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
      <div style={{
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--text)',
        marginBottom: 6,
      }}>{title}</div>
      <div style={{
        fontSize: 11,
        color: 'var(--text3)',
        lineHeight: 1.4,
      }}>{description}</div>
    </div>
  )
}
