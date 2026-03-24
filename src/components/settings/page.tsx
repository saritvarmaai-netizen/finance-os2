'use client'

import React, { useRef } from 'react'
import { toast } from 'sonner'
import { TabLayout } from '@/components/ui/TabLayout'
import { useData } from '@/lib/DataContext'
import { audit } from '@/lib/audit'

// Import modular settings components
import {
  AppearanceSettings,
  AIModelSettings,
  ExportSettings,
  DataSyncSettings,
  NotificationSettings,
  BackupSettings,
  SystemHealthSettings,
  DataManagementSettings,
} from './components'

// Custom hook for persistent localStorage state
function usePersistentState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [state, setState] = React.useState<T>(() => {
    try {
      const stored = localStorage.getItem('financeos_' + key)
      return stored !== null ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setPersistentState = (value: T) => {
    setState(value)
    try {
      localStorage.setItem('financeos_' + key, JSON.stringify(value))
    } catch {}
  }

  return [state, setPersistentState]
}

export default function SettingsPage() {
  // Appearance settings
  const [compactMode, setCompactMode] = usePersistentState('compactMode', false)
  const [fontSize, setFontSize] = usePersistentState('fontSize', 'Medium')

  // AI Model settings
  const [aiMode, setAiMode] = usePersistentState<'basic' | 'intelligent'>('aiMode', 'basic')
  const [aiProvider, setAiProvider] = usePersistentState('aiProvider', 'Google Gemini')
  const [aiModel, setAiModel] = usePersistentState('aiModel', 'Gemini 2.0 Flash')
  const [apiKey, setApiKey] = usePersistentState('apiKey', '')
  const [showApiKey, setShowApiKey] = usePersistentState('showApiKey', false)
  const [responseDetail, setResponseDetail] = usePersistentState('responseDetail', 'Detailed')

  // Export settings
  const [exportType, setExportType] = usePersistentState('exportType', 'All Data')
  const [exportDateRange, setExportDateRange] = usePersistentState('exportDateRange', 'FY 2025-26')
  const [entityFilter, setEntityFilter] = usePersistentState('entityFilter', 'All Entities')

  // Data & Sync settings
  const [autoImport, setAutoImport] = usePersistentState('autoImport', true)
  const [mfRefresh, setMfRefresh] = usePersistentState('mfRefresh', 'Weekly')
  const [shareRefresh, setShareRefresh] = usePersistentState('shareRefresh', 'Daily')
  const [selectedFYSetting, setSelectedFYSetting] = usePersistentState('selectedFYSetting', 'FY 2025-26')

  // Notification settings
  const [taxReminders, setTaxReminders] = usePersistentState('taxReminders', true)
  const [fdAlerts, setFdAlerts] = usePersistentState('fdAlerts', true)
  const [fdAlertDays, setFdAlertDays] = usePersistentState('fdAlertDays', 15)
  const [ltcgThreshold, setLtcgThreshold] = usePersistentState('ltcgThreshold', 80)
  const [idleCashAlert, setIdleCashAlert] = usePersistentState('idleCashAlert', true)

  // Backup settings
  const [autoBackup, setAutoBackup] = usePersistentState('autoBackup', 'Weekly')

  // Demo mode state
  const [demoMode, setDemoMode] = React.useState(true)
  const [isExporting, setIsExporting] = React.useState(false)
  const [isImporting, setIsImporting] = React.useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null)
  const [deleteStatus, setDeleteStatus] = React.useState<string | null>(null)

  const { resetData, refreshAll } = useData()
  
  // Fetch demo mode from settings API on mount
  React.useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.demoMode !== undefined) {
          setDemoMode(data.demoMode === 'true')
        }
      })
      .catch(console.error)
  }, [])
  
  // Toggle demo mode
  const handleToggleDemoMode = async () => {
    const newMode = !demoMode
    setDemoMode(newMode)
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'demoMode', value: String(newMode) }),
      })
      toast.success(newMode ? 'Demo mode enabled' : 'Demo mode disabled')
    } catch (error) {
      toast.error('Failed to update demo mode')
    }
  }
  
  // Export all data
  const handleExport = async () => {
    setIsExporting(true)
    try {
      const res = await fetch('/api/data')
      const data = await res.json()
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const date = new Date().toISOString().split('T')[0]
      a.download = `financeos-backup-${date}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Data exported successfully')
    } catch (error) {
      toast.error('Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }
  
  // Import data
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    setIsImporting(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      // Validate structure
      if (!data.accounts && !data.mfHoldings && !data.shareHoldings && !data.transactions) {
        throw new Error('Invalid backup file format')
      }
      
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      const result = await res.json()
      
      if (result.success) {
        toast.success(`Imported ${result.counts.accounts} accounts, ${result.counts.mfHoldings} MF holdings, ${result.counts.shareHoldings} shares`)
        refreshAll()
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to import data')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }
  
  // Reset to demo data
  const handleResetToDemo = async () => {
    try {
      const res = await fetch('/api/data?type=all&seedDemo=true', { method: 'DELETE' })
      const result = await res.json()
      
      if (result.success) {
        toast.success('Reset to demo data successfully')
        refreshAll()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error('Failed to reset data')
    }
  }

  // Handle delete with confirmation
  const handleDelete = (type: 'transactions' | 'mf' | 'shares' | 'all') => {
    if (deleteConfirm !== type) {
      setDeleteConfirm(type)
      setTimeout(() => setDeleteConfirm(null), 5000)
      return
    }
    resetData(type)
    audit.log({
      action: 'RESET', category: 'system',
      description: `Data reset: ${type}`,
      source: 'manual',
    })
    setDeleteStatus(`${type === 'all' ? 'All data' : type} deleted successfully`)
    setDeleteConfirm(null)
    setTimeout(() => setDeleteStatus(null), 3000)
  }

  return (
    <TabLayout>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
          Settings
        </h1>
        <div style={{ fontSize: 14, color: 'var(--text2)' }}>
          Customise your FinanceOS experience
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <AppearanceSettings 
            compactMode={compactMode} 
            setCompactMode={setCompactMode}
            fontSize={fontSize}
            setFontSize={setFontSize}
          />
          <AIModelSettings
            aiMode={aiMode}
            setAiMode={setAiMode}
            aiProvider={aiProvider}
            setAiProvider={setAiProvider}
            aiModel={aiModel}
            setAiModel={setAiModel}
            apiKey={apiKey}
            setApiKey={setApiKey}
            showApiKey={showApiKey}
            setShowApiKey={setShowApiKey}
            responseDetail={responseDetail}
            setResponseDetail={setResponseDetail}
          />
          <ExportSettings
            exportType={exportType}
            setExportType={setExportType}
            exportDateRange={exportDateRange}
            setExportDateRange={setExportDateRange}
            entityFilter={entityFilter}
            setEntityFilter={setEntityFilter}
          />
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <DataSyncSettings
            autoImport={autoImport}
            setAutoImport={setAutoImport}
            mfRefresh={mfRefresh}
            setMfRefresh={setMfRefresh}
            shareRefresh={shareRefresh}
            setShareRefresh={setShareRefresh}
            selectedFYSetting={selectedFYSetting}
            setSelectedFYSetting={setSelectedFYSetting}
          />
          <NotificationSettings
            taxReminders={taxReminders}
            setTaxReminders={setTaxReminders}
            fdAlerts={fdAlerts}
            setFdAlerts={setFdAlerts}
            fdAlertDays={fdAlertDays}
            setFdAlertDays={setFdAlertDays}
            ltcgThreshold={ltcgThreshold}
            setLtcgThreshold={setLtcgThreshold}
            idleCashAlert={idleCashAlert}
            setIdleCashAlert={setIdleCashAlert}
          />
          <BackupSettings
            autoBackup={autoBackup}
            setAutoBackup={setAutoBackup}
          />
          <SystemHealthSettings />
          <DataManagementSettings
            demoMode={demoMode}
            onToggleDemoMode={handleToggleDemoMode}
            isExporting={isExporting}
            onExport={handleExport}
            isImporting={isImporting}
            onImport={handleImport}
            onResetToDemo={handleResetToDemo}
            deleteConfirm={deleteConfirm}
            onDelete={handleDelete}
            deleteStatus={deleteStatus}
          />
        </div>
      </div>
    </TabLayout>
  )
}
