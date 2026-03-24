// src/mutual-funds/registry.ts
import { MFSummaryBar } from './components/MFSummaryBar'
import { HoldingsTable } from './components/HoldingsTable'
import { TaxHarvestingPanel } from './components/TaxHarvestingPanel'
import { OverlapAnalysis } from './components/OverlapAnalysis'
import { AIInsightPanel } from './components/AIInsightPanel'

export const registry = [
  { id: 'mf-summary', component: MFSummaryBar, enabled: true },
  { id: 'holdings-table', component: HoldingsTable, enabled: true },
  { id: 'tax-harvesting', component: TaxHarvestingPanel, enabled: true },
  { id: 'overlap-analysis', component: OverlapAnalysis, enabled: true },
  { id: 'ai-insight', component: AIInsightPanel, enabled: true },
]
