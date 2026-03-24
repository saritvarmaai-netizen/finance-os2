'use client'

import React from 'react'
import { MFHoldingDialog } from './MFHoldingDialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { MFHoldingRaw, MFHoldingComputed } from '@/lib/types'

interface MFEditData {
  id: string
  name: string
  amc: string
  category: string
  entity: string
  units: number
  avgNAV: number
  currentNAV: number
  xirr: number
  taxType: string
}

interface MFDialogManagerProps {
  // Dialog open states
  dialogOpen: boolean
  deleteConfirmOpen: boolean
  
  // Edit data
  editData: MFEditData | null
  
  // Delete confirmation data
  deleteConfirm: { id: string; name: string }
  
  // State setters
  setDialogOpen: (open: boolean) => void
  setEditData: (data: MFEditData | null) => void
  setDeleteConfirm: (state: { open: boolean; id: string; name: string }) => void
  
  // Callbacks
  onDeleteConfirm: () => Promise<void>
}

export function MFDialogManager({
  dialogOpen,
  deleteConfirmOpen,
  editData,
  deleteConfirm,
  setDialogOpen,
  setDeleteConfirm,
  onDeleteConfirm,
}: MFDialogManagerProps) {
  return (
    <>
      {/* Add/Edit Dialog */}
      <MFHoldingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editData={editData}
      />
      
      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        title="Delete Mutual Fund Holding"
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={onDeleteConfirm}
        variant="destructive"
      />
    </>
  )
}

// Export the type for use in parent components
export type { MFEditData }
