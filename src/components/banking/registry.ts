// src/banking/registry.ts
import { AccountCards } from './components/AccountCards'
import { FDTracker } from './components/FDTracker'
import { TransactionTable } from './components/TransactionTable'

export const registry = [
  { id: 'account-cards', component: AccountCards, enabled: true },
  { id: 'fd-tracker', component: FDTracker, enabled: true },
  { id: 'transaction-table', component: TransactionTable, enabled: true },
]
