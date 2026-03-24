import { sanitiseForLLM } from './sanitise'
import { audit } from './audit'
import type { AIProvider, AIMode } from './types'

function getConfig(): import('./types').AIConfig | null {
  try {
    const parse = <T>(key: string, def: T): T => {
      const val = localStorage.getItem('financeos_' + key)
      return val ? JSON.parse(val) : def
    }
    const provider = parse('aiProvider', 'gemini') as AIProvider
    const apiKey   = parse('apiKey', '')
    const model    = parse('aiModel', undefined)
    const mode     = parse('aiMode', 'basic') as AIMode
    if (!apiKey) return null
    return { provider, apiKey, model, mode }
  } catch { return null }
}

const PROVIDER_ENDPOINTS: Record<AIProvider, (model?: string) => { url: string; authHeader: string }> = {
  gemini: (model = 'gemini-2.0-flash') => ({
    url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    authHeader: 'key',
  }),
  openrouter: (model = 'meta-llama/llama-3.1-8b-instruct:free') => ({
    url: 'https://openrouter.ai/api/v1/chat/completions',
    authHeader: 'Bearer',
  }),
  nvidia: (model = 'meta/llama-3.1-8b-instruct') => ({
    url: 'https://integrate.api.nvidia.com/v1/chat/completions',
    authHeader: 'Bearer',
  }),
  claude: (model = 'claude-haiku-4-5-20251001') => ({
    url: 'https://api.anthropic.com/v1/messages',
    authHeader: 'x-api-key',
  }),
}

async function loadSkill(skillPath: string): Promise<string> {
  try {
    const res = await fetch(`/skills/${skillPath}`)
    if (!res.ok) return ''
    return await res.text()
  } catch { return '' }
}

async function callGemini(prompt: string, apiKey: string, model?: string): Promise<string> {
  const m = model ?? 'gemini-2.0-flash'
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  )
  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response'
}

async function callOpenAICompatible(
  prompt: string, apiKey: string, baseUrl: string, model: string
): Promise<string> {
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
    }),
  })
  const data = await res.json()
  return data?.choices?.[0]?.message?.content ?? 'No response'
}

export async function askAI(
  question: string,
  contextData: Record<string, unknown>,
  skillPath?: string,
): Promise<{ response: string; sanitisedPreview: string; mode: AIMode; error?: string }> {
  const config = getConfig()
  if (!config?.apiKey) {
    return {
      response: '',
      sanitisedPreview: '',
      mode: 'basic',
      error: 'No API key configured. Please add your API key in Settings.',
    }
  }

  // Always sanitise data before sending
  const sanitised = sanitiseForLLM(contextData)
  const sanitisedPreview = JSON.stringify(sanitised, null, 2)

  // Build prompt
  let prompt = ''
  if (config.mode === 'intelligent' && skillPath) {
    const skill = await loadSkill(skillPath)
    if (skill) {
      prompt = `${skill}\n\n---\n\nDATA:\n${sanitisedPreview}\n\nQUESTION:\n${question}`
    } else {
      prompt = `${question}\n\nDATA:\n${sanitisedPreview}`
    }
  } else {
    prompt = `You are a financial advisor for Indian personal finance. Answer this question using only the provided data.\n\nDATA:\n${sanitisedPreview}\n\nQUESTION:\n${question}`
  }

  try {
    let response = ''
    if (config.provider === 'gemini') {
      response = await callGemini(prompt, config.apiKey, config.model)
    } else if (config.provider === 'openrouter') {
      response = await callOpenAICompatible(
        prompt, config.apiKey,
        'https://openrouter.ai/api/v1/chat/completions',
        config.model ?? 'meta-llama/llama-3.1-8b-instruct:free'
      )
    } else if (config.provider === 'nvidia') {
      response = await callOpenAICompatible(
        prompt, config.apiKey,
        'https://integrate.api.nvidia.com/v1/chat/completions',
        config.model ?? 'meta/llama-3.1-8b-instruct'
      )
    }

    audit.log({
      action: 'AI_CALL',
      category: 'system',
      description: `AI query: ${question.substring(0, 60)}...`,
      after: { provider: config.provider, mode: config.mode, skill: skillPath ?? 'none' },
      source: 'ai',
    })

    return { response, sanitisedPreview, mode: config.mode }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return {
      response: '',
      sanitisedPreview,
      mode: config.mode,
      error: `API call failed: ${message}`,
    }
  }
}

// Re-export types for backward compatibility
export type { AIProvider, AIMode } from './types'
