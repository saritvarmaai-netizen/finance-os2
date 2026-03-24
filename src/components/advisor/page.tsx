import React, { useState, useRef, useEffect, useMemo } from 'react'
import { TabLayout } from '@/components/ui/TabLayout'
import { useData } from '@/lib/DataContext'
import { useEntity } from '@/lib/entity-context'
import { askAI } from '@/lib/ai-client'
import { audit } from '@/lib/audit'
import { routeToSkill, buildContextFromKeys } from '@/lib/skill-router'
import { fmt } from '@/lib/utils'
import { Send, Sparkles, RefreshCw, Trash2, Bot, User, Eye, EyeOff, Info, Filter } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  skill?: string
  sanitisedPreview?: string
  error?: boolean
  loading?: boolean
}

const QUICK_ACTIONS = [
  { label: '📊 Daily Briefing',    question: 'Give me a financial briefing — what should I focus on today?', skill: 'dashboard/daily-briefing.md' },
  { label: '🌾 Harvest LTCG',      question: 'Identify my best LTCG tax harvesting opportunities before March 31', skill: 'mutual-funds/recommendations.md' },
  { label: '🧾 Tax Position',      question: 'What is my current income tax position for all three entities? Which regime saves more?', skill: 'income-tax/optimisation.md' },
  { label: '📈 MF Analysis',       question: 'Analyse my mutual fund portfolio — overlap, rebalancing, performance', skill: 'mutual-funds/recommendations.md' },
  { label: '🏦 Banking Summary',   question: 'Summarise my banking — idle cash, FD maturities, anything to action', skill: 'banking/analysis.md' },
  { label: '💸 Cashflow Review',   question: 'Review my income and expenses — savings rate, patterns, suggestions', skill: 'income-expenses/cashflow.md' },
]

function fmt_time(date: Date): string {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export default function AdvisorPage() {
  const data = useData()
  const { activeEntities } = useEntity()
  
  // Filter all data by active entities
  const filteredData = useMemo(() => {
    const filteredAccounts = data.accounts.filter(a => activeEntities.includes(a.entity as 'personal' | 'huf' | 'firm'))
    const filteredFDs = data.fds.filter(f => activeEntities.includes(f.entity as 'personal' | 'huf' | 'firm'))
    const filteredTransactions = data.transactions.filter(t => activeEntities.includes(t.entity as 'personal' | 'huf' | 'firm'))
    const filteredMFHoldings = data.mfHoldings.filter(h => activeEntities.includes(h.entity as 'personal' | 'huf' | 'firm'))
    const filteredShareHoldings = data.shareHoldings.filter(h => activeEntities.includes(h.entity as 'personal' | 'huf' | 'firm'))
    
    // Recompute totals for filtered data
    const totalBankBalance = filteredAccounts.reduce((sum, a) => sum + a.balance, 0)
    const totalFDs = filteredFDs.reduce((sum, f) => sum + f.principal, 0)
    const mfTotals = {
      totalInvested: filteredMFHoldings.reduce((sum, h) => sum + h.invested, 0),
      totalCurrentValue: filteredMFHoldings.reduce((sum, h) => sum + h.currentValue, 0),
      totalGain: filteredMFHoldings.reduce((sum, h) => sum + h.gain, 0),
      totalReturn: 0 as number | string,
    }
    mfTotals.totalReturn = mfTotals.totalInvested > 0 ? Number(((mfTotals.totalGain / mfTotals.totalInvested) * 100).toFixed(1)) : 0
    
    const shareTotals = {
      totalInvested: filteredShareHoldings.reduce((sum, h) => sum + h.invested, 0),
      totalCurrentValue: filteredShareHoldings.reduce((sum, h) => sum + h.currentValue, 0),
      totalGain: filteredShareHoldings.reduce((sum, h) => sum + h.gain, 0),
      totalDividend: filteredShareHoldings.reduce((sum, h) => sum + h.dividendFY, 0),
    }
    
    const netWorth = mfTotals.totalCurrentValue + shareTotals.totalCurrentValue + totalFDs + totalBankBalance
    const totalInvestments = mfTotals.totalCurrentValue + shareTotals.totalCurrentValue + totalFDs
    
    // Compute entity net worth for filtered data
    const entityNetWorth = { personal: 0, huf: 0, firm: 0 }
    filteredAccounts.forEach(a => {
      const entity = a.entity as keyof typeof entityNetWorth
      if (entity in entityNetWorth) entityNetWorth[entity] += a.balance
    })
    filteredFDs.forEach(f => {
      const entity = f.entity as keyof typeof entityNetWorth
      if (entity in entityNetWorth) entityNetWorth[entity] += f.principal
    })
    filteredMFHoldings.forEach(h => {
      const entity = h.entity as keyof typeof entityNetWorth
      if (entity in entityNetWorth) entityNetWorth[entity] += h.currentValue
    })
    filteredShareHoldings.forEach(h => {
      const entity = h.entity as keyof typeof entityNetWorth
      if (entity in entityNetWorth) entityNetWorth[entity] += h.currentValue
    })
    
    return {
      accounts: filteredAccounts,
      fds: filteredFDs,
      transactions: filteredTransactions,
      mfHoldings: filteredMFHoldings,
      shareHoldings: filteredShareHoldings,
      mfTotals,
      shareTotals,
      totalBankBalance,
      netWorth,
      totalInvestments,
      entityNetWorth,
      ltcg: data.ltcg,
      monthlyData: data.monthlyData,
      assetAllocation: data.assetAllocation,
    }
  }, [data, activeEntities])
  
  // Entity label for display
  const entityLabel = useMemo(() => {
    if (activeEntities.length === 3) return 'All Entities'
    if (activeEntities.length === 0) return 'No Entity Selected'
    return activeEntities.map(e => e === 'personal' ? 'Self' : e.toUpperCase()).join(' + ')
  }, [activeEntities])
  
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    role: 'system',
    content: '👋 Welcome to your Financial Advisor. I have access to all your portfolio data across banking, mutual funds, shares, and tax. Ask me anything or use the quick actions below.',
    timestamp: fmt_time(new Date()),
  }])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPreviewId, setShowPreviewId] = useState<string | null>(null)
  const [apiKeyMissing, setApiKeyMissing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (question: string, forcedSkill?: string) => {
    if (!question.trim() || isLoading) return

    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: question.trim(),
      timestamp: fmt_time(new Date()),
    }

    const loadingMsg: Message = {
      id: `loading_${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: fmt_time(new Date()),
      loading: true,
    }

    setMessages(prev => [...prev, userMsg, loadingMsg])
    setInput('')
    setIsLoading(true)
    setApiKeyMissing(false)

    // Route to skill
    const route = forcedSkill
      ? { skillPath: forcedSkill, category: 'system', contextKeys: ['netWorth','mfTotals','shareTotals','totalBankBalance','mfHoldings','shareHoldings','fds','accounts'] }
      : routeToSkill(question)

    const contextData = buildContextFromKeys(route.contextKeys, filteredData)

    const result = await askAI(question, contextData, route.skillPath)

    if (result.error?.includes('No API key')) {
      setApiKeyMissing(true)
    }

    const assistantMsg: Message = {
      id: `resp_${Date.now()}`,
      role: 'assistant',
      content: result.error ? result.error : result.response,
      timestamp: fmt_time(new Date()),
      skill: route.skillPath,
      sanitisedPreview: result.sanitisedPreview,
      error: !!result.error,
    }

    setMessages(prev => prev.filter(m => !m.loading).concat(assistantMsg))
    setIsLoading(false)

    audit.log({
      action: 'AI_CALL',
      category: route.category as any,
      description: `Advisor: ${question.substring(0, 60)}`,
      after: { skill: route.skillPath, mode: result.mode },
      source: 'ai',
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'system',
      content: '👋 Chat cleared. Ask me anything about your finances.',
      timestamp: fmt_time(new Date()),
    }])
    setApiKeyMissing(false)
  }

  const apiKey = localStorage.getItem('financeos_apiKey')
  const hasApiKey = apiKey && JSON.parse(apiKey)

  return (
    <TabLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
            Financial Advisor
          </h1>
          <div style={{ fontSize: 14, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            AI-powered analysis of your complete portfolio
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
              background: hasApiKey ? 'rgba(34,197,94,0.12)' : 'rgba(244,63,94,0.12)',
              color: hasApiKey ? 'var(--green)' : 'var(--red)',
            }}>
              {hasApiKey ? '● Connected' : '● No API Key'}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
              background: activeEntities.length === 3 ? 'rgba(240,165,0,0.12)' : 'rgba(129,140,248,0.12)',
              color: activeEntities.length === 3 ? 'var(--gold)' : 'var(--personal)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <Filter size={10} />
              {entityLabel}
            </span>
          </div>
        </div>
        <button
          onClick={clearChat}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text2)', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}
        >
          <Trash2 size={14} /> Clear Chat
        </button>
      </div>

      {/* No API key banner */}
      {(!hasApiKey || apiKeyMissing) && (
        <div style={{
          padding: '14px 18px', borderRadius: 'var(--radius)',
          background: 'rgba(240,165,0,0.07)', border: '1px solid rgba(240,165,0,0.25)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <Info size={16} style={{ color: 'var(--gold)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>Add your API key to enable AI analysis. </span>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Go to Settings → AI Model → API Key. Works with Gemini (free), OpenRouter (free tier), or any other provider.</span>
          </div>
          <a href="/settings" style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)', textDecoration: 'none', padding: '6px 12px', border: '1px solid var(--gold)', borderRadius: 6, flexShrink: 0 }}>
            Open Settings
          </a>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text2)', marginBottom: 10 }}>
          Quick Actions
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {QUICK_ACTIONS.map(action => (
            <button
              key={action.label}
              onClick={() => sendMessage(action.question, action.skill)}
              disabled={isLoading}
              style={{
                padding: '7px 14px', borderRadius: 20,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text2)', fontSize: 12, fontWeight: 500,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: isLoading ? 0.5 : 1,
              }}
              onMouseEnter={e => { if (!isLoading) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--gold)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold)' } }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text2)' }}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column',
        height: 520, overflow: 'hidden',
      }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              display: 'flex', gap: 12,
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
            }}>
              {/* Avatar */}
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: msg.role === 'user'
                  ? 'rgba(129,140,248,0.15)'
                  : msg.role === 'system'
                  ? 'rgba(56,189,248,0.15)'
                  : 'rgba(240,165,0,0.15)',
                color: msg.role === 'user' ? 'var(--personal)' : msg.role === 'system' ? 'var(--blue)' : 'var(--gold)',
              }}>
                {msg.role === 'user' ? <User size={15} /> : <Bot size={15} />}
              </div>

              {/* Bubble */}
              <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', gap: 4, alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  padding: '12px 16px', borderRadius: 12,
                  borderBottomRightRadius: msg.role === 'user' ? 4 : 12,
                  borderBottomLeftRadius: msg.role === 'user' ? 12 : 4,
                  background: msg.role === 'user'
                    ? 'rgba(129,140,248,0.15)'
                    : msg.error
                    ? 'rgba(244,63,94,0.08)'
                    : 'var(--surface2)',
                  border: `1px solid ${msg.role === 'user' ? 'rgba(129,140,248,0.25)' : msg.error ? 'rgba(244,63,94,0.2)' : 'var(--border)'}`,
                }}>
                  {msg.loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text2)', fontSize: 13 }}>
                      <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite', color: 'var(--gold)' }} />
                      Analysing your portfolio...
                    </div>
                  ) : (
                    <div style={{
                      fontSize: 13, lineHeight: 1.7,
                      color: msg.error ? 'var(--red)' : 'var(--text)',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {msg.content}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: msg.role === 'user' ? 0 : 4 }}>
                  <span style={{ fontSize: 10, color: 'var(--text3)' }}>{msg.timestamp}</span>
                  {msg.skill && (
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 20, background: 'rgba(240,165,0,0.1)', color: 'var(--gold)' }}>
                      {msg.skill.split('/')[0]}
                    </span>
                  )}
                  {msg.sanitisedPreview && (
                    <button
                      onClick={() => setShowPreviewId(showPreviewId === msg.id ? null : msg.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, fontSize: 10 }}
                    >
                      {showPreviewId === msg.id ? <EyeOff size={10} /> : <Eye size={10} />}
                      {showPreviewId === msg.id ? 'hide data' : 'what was sent?'}
                    </button>
                  )}
                </div>

                {/* Sanitised preview */}
                {showPreviewId === msg.id && msg.sanitisedPreview && (
                  <div style={{
                    maxWidth: 400, padding: '10px 12px',
                    background: 'var(--surface2)', border: '1px solid var(--border)',
                    borderRadius: 8, fontSize: 10, color: 'var(--text2)',
                  }}>
                    <div style={{ fontWeight: 700, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      🔒 Anonymised data sent to AI
                    </div>
                    <pre style={{ margin: 0, overflow: 'auto', maxHeight: 160, lineHeight: 1.5 }}>
                      {msg.sanitisedPreview}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)' }} />

        {/* Input Area */}
        <div style={{ padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your finances... (Enter to send, Shift+Enter for new line)"
            rows={2}
            disabled={isLoading}
            style={{
              flex: 1, background: 'var(--surface2)',
              border: '1px solid var(--border)', borderRadius: 10,
              color: 'var(--text)', fontFamily: 'inherit', fontSize: 13,
              padding: '10px 14px', resize: 'none', outline: 'none',
              lineHeight: 1.5,
              opacity: isLoading ? 0.6 : 1,
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--gold)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            style={{
              width: 42, height: 42, borderRadius: 10, border: 'none',
              background: input.trim() && !isLoading ? 'var(--gold)' : 'var(--surface3)',
              color: input.trim() && !isLoading ? '#000' : 'var(--text3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s', flexShrink: 0,
            }}
          >
            {isLoading ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
          </button>
        </div>

        {/* Footer hint */}
        <div style={{ padding: '6px 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>
            🔒 Personal data anonymised before sending · Skill auto-selected from your question
          </span>
          <span style={{ fontSize: 10, color: 'var(--text3)' }}>
            {isLoading ? 'Thinking...' : `${messages.filter(m => m.role !== 'system').length} messages`}
          </span>
        </div>
      </div>
    </TabLayout>
  )
}
