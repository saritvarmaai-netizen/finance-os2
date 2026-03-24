// ============================================
// FinanceOS - Centralized Type Definitions
// ============================================

// --------------------------------------------
// Core Entity Types
// --------------------------------------------

/** Entity type for filtering data across the application */
export type Entity = 'personal' | 'huf' | 'firm' | 'all'

/** Tax regime selection */
export type TaxRegime = 'old' | 'new'

/** FD Status type */
export type FDStatus = 'active' | 'maturing' | 'matured'

/** Tax type for capital gains */
export type TaxType = 'LTCG' | 'STCG'

// --------------------------------------------
// Account & Banking Types
// --------------------------------------------

/** Bank Account - used in banking module and DataContext */
export interface Account {
  id: string
  bank: string
  name: string
  entity: Entity
  balance: number
  monthlyInflow: number
  monthlyOutflow: number
  isAutoFD: boolean
  createdAt?: string
  updatedAt?: string
  fds?: FixedDeposit[]
  interestClubbedTo?: string
}

/** Fixed Deposit - linked to an account */
export interface FixedDeposit {
  id: string
  accountId: string | null
  entity: Entity
  principal: number
  rate: number
  startDate: string
  maturityDate: string
  maturityAmount: number
  daysLeft: number
  tdsExpected: number
  isAutoFD: boolean
  status: FDStatus
  account?: {
    id: string
    bank: string
    name: string
  }
  createdAt?: string
  updatedAt?: string
}

/** Transaction record in the ledger */
export interface Transaction {
  id: string
  date: string
  description: string
  account: string
  category: string
  debit: number
  credit: number
  entity: Entity
  aiConfidence: number
  isTransfer: boolean
  createdAt?: string
  updatedAt?: string
}

// --------------------------------------------
// Mutual Funds Types
// --------------------------------------------

/** Raw MF Holding from API/Database */
export interface MFHoldingRaw {
  id: string
  name: string
  amc: string
  category: string
  entity: Entity
  units: number
  avgNAV: number
  currentNAV: number
  xirr: number
  taxType: TaxType
  createdAt?: string
  updatedAt?: string
}

/** MF Holding with computed values */
export interface MFHoldingComputed extends MFHoldingRaw {
  invested: number
  currentValue: number
  gain: number
  gainPct: number
  change1D: number
}

// --------------------------------------------
// Shares Types
// --------------------------------------------

/** Raw Share Holding from API/Database */
export interface ShareHoldingRaw {
  id: string
  symbol: string
  company: string
  exchange: string
  sector: string
  entity: Entity
  qty: number
  avgPrice: number
  cmp: number
  dividendFY: number
  taxType: TaxType
  createdAt?: string
  updatedAt?: string
}

/** Share Holding with computed values */
export interface ShareHoldingComputed extends ShareHoldingRaw {
  invested: number
  currentValue: number
  gain: number
  gainPct: number
}

// --------------------------------------------
// Aggregate Types
// --------------------------------------------

/** MF totals aggregate */
export interface MFTotals {
  totalInvested: number
  totalCurrentValue: number
  totalGain: number
  totalReturn: number | string
}

/** Share totals aggregate */
export interface ShareTotals {
  totalInvested: number
  totalCurrentValue: number
  totalGain: number
  totalDividend: number
}

// --------------------------------------------
// Settings & Configuration Types
// --------------------------------------------

/** LTCG tracking */
export interface LTCG {
  booked: number
  limit: number
}

/** Application settings (key-value store) */
export interface AppSettings {
  demoMode?: string
  ltcgBooked?: string
  ltcgLimit?: string
  [key: string]: string | undefined
}

// --------------------------------------------
// Chart Data Types
// --------------------------------------------

/** Monthly income/expense data for charts */
export interface MonthlyDataItem {
  name: string
  income: number
  expense: number
}

/** Asset allocation data for donut chart */
export interface AssetAllocationItem {
  name: string
  value: number
  color: string
  amount: number
}

// --------------------------------------------
// Entity Net Worth Type
// --------------------------------------------

/** Net worth breakdown by entity */
export interface EntityNetWorth {
  personal: number
  huf: number
  firm: number
}

// --------------------------------------------
// Notification Types
// --------------------------------------------

/** User notification */
export interface Notification {
  id: string
  type: 'warning' | 'reminder' | 'opportunity' | 'info'
  title: string
  body: string
  priority: 'high' | 'medium' | 'low' | 'info'
  timeAgo: string
}

// --------------------------------------------
// Tax Types
// --------------------------------------------

/** Advance tax payment tracking */
export interface AdvanceTaxPayment {
  quarter: string
  label: string
  percentage: number
  dueDate: string
  amount: number
  paidAmount: number
  status: 'PAID' | 'PARTIAL' | 'DUE' | 'OVERDUE'
}

// --------------------------------------------
// Context Types
// --------------------------------------------

/** DataContext interface - provides all data and CRUD operations */
export interface DataContextType {
  // Data
  accounts: Account[]
  fds: FixedDeposit[]
  transactions: Transaction[]
  mfHoldings: MFHoldingComputed[]
  shareHoldings: ShareHoldingComputed[]
  mfTotals: MFTotals
  shareTotals: ShareTotals
  totalBankBalance: number
  netWorth: number
  totalInvestments: number
  entityNetWorth: EntityNetWorth
  ltcg: LTCG
  monthlyData: MonthlyDataItem[]
  assetAllocation: AssetAllocationItem[]
  
  // State
  loading: boolean
  error: string | null
  
  // FY selector
  selectedFY: string
  setSelectedFY: (fy: string) => void
  
  // CRUD functions
  refreshAll: () => Promise<void>
  
  // Account operations
  addAccount: (data: Partial<Account>) => Promise<void>
  updateAccount: (id: string, data: Partial<Account>) => Promise<void>
  deleteAccount: (id: string) => Promise<void>
  updateAccountBalance: (id: string, balance: number) => Promise<void>
  
  // FD operations
  addFD: (data: Partial<FixedDeposit>) => Promise<void>
  updateFD: (id: string, data: Partial<FixedDeposit>) => Promise<void>
  deleteFD: (id: string) => Promise<void>
  
  // Transaction operations
  addTransaction: (data: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  
  // MF operations
  addMFHolding: (data: Partial<MFHoldingRaw>) => Promise<void>
  updateMFHolding: (id: string, data: Partial<MFHoldingRaw>) => Promise<void>
  deleteMFHolding: (id: string) => Promise<void>
  updateMFNav: (id: string, nav: number) => Promise<void>
  
  // Share operations
  addShareHolding: (data: Partial<ShareHoldingRaw>) => Promise<void>
  updateShareHolding: (id: string, data: Partial<ShareHoldingRaw>) => Promise<void>
  deleteShareHolding: (id: string) => Promise<void>
  updateSharePrice: (id: string, cmp: number) => Promise<void>
  
  // Reset
  resetData: (type: 'all' | 'transactions' | 'mf' | 'shares') => Promise<void>
}

/** EntityContext interface */
export interface EntityContextType {
  activeEntities: Entity[]
  toggleEntity: (entity: Entity) => void
  isActive: (entity: Entity) => boolean
}

// --------------------------------------------
// Component Prop Types
// --------------------------------------------

/** Generic dialog props */
export interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Account dialog props */
export interface AccountDialogProps extends DialogProps {
  account?: Account | null
}

/** FD dialog props */
export interface FDDialogProps extends DialogProps {
  fd?: FixedDeposit | null
  mode: 'add' | 'edit'
}

/** Transaction dialog props */
export type TransactionDialogProps = DialogProps

/** MF Holding dialog props */
export interface MFHoldingDialogProps extends DialogProps {
  editData?: MFHoldingRaw | null
}

/** Share Holding dialog props */
export interface ShareHoldingDialogProps extends DialogProps {
  editHolding?: ShareHoldingComputed | null
}

// --------------------------------------------
// UI Component Prop Types
// --------------------------------------------

/** Settings page - SettingsRow props */
export interface SettingsRowProps {
  label: string
  desc?: string
  children: React.ReactNode
  isLast: boolean
}

/** Settings page - ThemeButton props */
export interface ThemeButtonProps {
  icon: React.ReactNode
  label: string
  active: boolean
}

/** Settings page - HealthRow props */
export interface HealthRowProps {
  label: string
  status: string
}

/** Income Tax page - RegimeCard line item */
export interface RegimeCardLine {
  label: string
  value: number | string
  color?: string
  isBold?: boolean
  isDimmed?: boolean
}

/** Income Tax page - RegimeCard props */
export interface RegimeCardProps {
  title: string
  icon: string
  isBest: boolean
  isActive: boolean
  onSelect: () => void
  lines: RegimeCardLine[]
  totalTax: number
}

/** Income Tax page - TimelineNode props */
export interface TimelineNodeProps {
  label: string
  amount: number
  paidAmount: number
  date: string
  status: 'PAID' | 'PARTIAL' | 'DUE' | 'OVERDUE'
  color: string
  isPaid: boolean
}

/** Income Tax page - BreakevenRow props */
export interface BreakevenRowProps {
  label: string
  value: string
  color?: string
}

/** Income Tax page - ActionRow props */
export interface ActionRowProps {
  label: string
  amount: string
}

/** Income Tax page - IncomeSummaryRow props */
export interface IncomeSummaryRowProps {
  label: string
  amount: number
  badge?: string
  badgeColor?: string
  subtitle?: string
}

/** Income & Expenses page - SummaryCard props */
export interface SummaryCardProps {
  label: string
  value: string
  color: string
  subtitle: string
}

/** Income & Expenses page - SourceItem for income/expense sources */
export interface SourceItem {
  label: string
  color: string
  amount: number
  rawCategory?: string
}

/** Income & Expenses page - SourceRow props */
export interface SourceRowProps {
  item: SourceItem
  max: number
}

/** Flow step type for investment transaction links */
export type FlowStepType = 'date' | 'bank' | 'category' | 'investment' | 'units' | 'tax'

/** Income & Expenses page - StepChip props */
export interface StepChipProps {
  label: string
  type: FlowStepType
}

/** Dashboard page - InvestmentRow props */
export interface InvestmentRowProps {
  label: string
  value: string
  color?: string
}

/** Dashboard page - ActionItem props */
export interface ActionItemProps {
  icon: string
  iconBg: string
  iconColor: string
  title: string
  desc: string
  priority: string
  impact: string
  date: string
}

// --------------------------------------------
// AI Types
// --------------------------------------------

/** AI Provider type */
export type AIProvider = 'gemini' | 'openrouter' | 'nvidia' | 'claude'

/** AI Response mode */
export type AIMode = 'basic' | 'intelligent'

/** AI Response mode for display */
export type AIResponseMode = 'basic' | 'reasoning'

/** AI Config for client */
export interface AIConfig {
  provider: AIProvider
  apiKey: string
  model?: string
  mode: AIMode
}

/** Skill match result - used for routing AI queries to appropriate skills */
export interface SkillMatch {
  skillPath: string
  category: string
  contextKeys: string[]
}

// --------------------------------------------
// Utility Types
// --------------------------------------------

/** Sanitise options for anonymising data before sending to AI */
export interface SanitiseOptions {
  replaceNames?: boolean
  replaceBanks?: boolean
  replaceFunds?: boolean
  replaceCompanies?: boolean
}

// --------------------------------------------
// Legacy Compatibility Types
// --------------------------------------------

// These types are kept for backward compatibility with existing code

/** @deprecated Use FixedDeposit instead */
export type FD = FixedDeposit

/** @deprecated Use MFHoldingComputed instead */
export type MFHolding = MFHoldingComputed

/** @deprecated Use ShareHoldingComputed instead */
export type ShareHolding = ShareHoldingComputed
