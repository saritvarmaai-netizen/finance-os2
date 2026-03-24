// src/settings/registry.ts
import { AppearanceSettings } from './components/AppearanceSettings'
import { AIModelSettings } from './components/AIModelSettings'
import { DataSyncSettings } from './components/DataSyncSettings'
import { NotificationSettings } from './components/NotificationSettings'
import { BackupSettings } from './components/BackupSettings'

export const registry = [
  { id: 'appearance', component: AppearanceSettings, enabled: true },
  { id: 'ai-model', component: AIModelSettings, enabled: true },
  { id: 'data-sync', component: DataSyncSettings, enabled: true },
  { id: 'notifications', component: NotificationSettings, enabled: true },
  { id: 'backup', component: BackupSettings, enabled: true },
]
