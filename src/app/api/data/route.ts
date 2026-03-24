import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Type definitions for import data
interface ImportAccount {
  id: string
  bank: string
  name: string
  entity: string
  balance: number
  monthlyInflow?: number
  monthlyOutflow?: number
  isAutoFD?: boolean
  isClubbed?: boolean
}

interface ImportFixedDeposit {
  id: string
  accountId: string | null
  entity: string
  principal: number
  rate: number
  startDate: string
  maturityDate: string
  maturityAmount: number
  daysLeft: number
  tdsExpected?: number
  isAutoFD?: boolean
  status?: string
}

interface ImportTransaction {
  id: string
  date: string
  description: string
  account: string
  category: string
  debit?: number
  credit?: number
  entity: string
  aiConfidence?: number
  isTransfer?: boolean
}

interface ImportMFHolding {
  id: string
  name: string
  amc: string
  category: string
  entity: string
  units: number
  avgNAV: number
  currentNAV: number
  xirr?: number
  taxType?: string
}

interface ImportShareHolding {
  id: string
  symbol: string
  company: string
  exchange?: string
  sector?: string
  entity: string
  qty: number
  avgPrice: number
  cmp: number
  dividendFY?: number
  taxType?: string
}

interface ImportData {
  accounts?: ImportAccount[]
  fixedDeposits?: ImportFixedDeposit[]
  transactions?: ImportTransaction[]
  mfHoldings?: ImportMFHolding[]
  shareHoldings?: ImportShareHolding[]
  settings?: Record<string, string>
}

// GET - Export all data as JSON
export async function GET() {
  try {
    const [accounts, fds, transactions, mfHoldings, shareHoldings, settings] = await Promise.all([
      db.account.findMany({ orderBy: { createdAt: 'desc' } }),
      db.fixedDeposit.findMany({ orderBy: { createdAt: 'desc' } }),
      db.transaction.findMany({ orderBy: { createdAt: 'desc' } }),
      db.mFHolding.findMany({ orderBy: { createdAt: 'desc' } }),
      db.shareHolding.findMany({ orderBy: { createdAt: 'desc' } }),
      db.appSettings.findMany(),
    ])

    const settingsObj = settings.reduce((acc, s) => {
      acc[s.key] = s.value
      return acc
    }, {} as Record<string, string>)

    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      accounts,
      fixedDeposits: fds,
      transactions,
      mfHoldings,
      shareHoldings,
      settings: settingsObj,
    }

    return NextResponse.json(exportData)
  } catch (error) {
    console.error('Error exporting data:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}

// POST - Import data from JSON
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ImportData
    const { accounts, fixedDeposits, transactions, mfHoldings, shareHoldings, settings } = body

    // Clear existing data first
    await Promise.all([
      db.transaction.deleteMany(),
      db.fixedDeposit.deleteMany(),
      db.account.deleteMany(),
      db.mFHolding.deleteMany(),
      db.shareHolding.deleteMany(),
      db.appSettings.deleteMany(),
    ])

    // Import accounts
    if (accounts?.length) {
      await db.account.createMany({
        data: accounts.map((a) => ({
          id: a.id,
          bank: a.bank,
          name: a.name,
          entity: a.entity,
          balance: a.balance,
          monthlyInflow: a.monthlyInflow || 0,
          monthlyOutflow: a.monthlyOutflow || 0,
          isAutoFD: a.isAutoFD || false,
          isClubbed: a.isClubbed || false,
        })),
        skipDuplicates: true,
      })
    }

    // Import FDs
    if (fixedDeposits?.length) {
      await db.fixedDeposit.createMany({
        data: fixedDeposits.map((fd) => ({
          id: fd.id,
          accountId: fd.accountId,
          entity: fd.entity,
          principal: fd.principal,
          rate: fd.rate,
          startDate: fd.startDate,
          maturityDate: fd.maturityDate,
          maturityAmount: fd.maturityAmount,
          daysLeft: fd.daysLeft,
          tdsExpected: fd.tdsExpected || 0,
          isAutoFD: fd.isAutoFD || false,
          status: fd.status || 'active',
        })),
        skipDuplicates: true,
      })
    }

    // Import transactions
    if (transactions?.length) {
      await db.transaction.createMany({
        data: transactions.map((t) => ({
          id: t.id,
          date: t.date,
          description: t.description,
          account: t.account,
          category: t.category,
          debit: t.debit || 0,
          credit: t.credit || 0,
          entity: t.entity,
          aiConfidence: t.aiConfidence || 100,
          isTransfer: t.isTransfer || false,
        })),
        skipDuplicates: true,
      })
    }

    // Import MF holdings
    if (mfHoldings?.length) {
      await db.mFHolding.createMany({
        data: mfHoldings.map((mf) => ({
          id: mf.id,
          name: mf.name,
          amc: mf.amc,
          category: mf.category,
          entity: mf.entity,
          units: mf.units,
          avgNAV: mf.avgNAV,
          currentNAV: mf.currentNAV,
          xirr: mf.xirr || 0,
          taxType: mf.taxType || 'LTCG',
        })),
        skipDuplicates: true,
      })
    }

    // Import share holdings
    if (shareHoldings?.length) {
      await db.shareHolding.createMany({
        data: shareHoldings.map((sh) => ({
          id: sh.id,
          symbol: sh.symbol,
          company: sh.company,
          exchange: sh.exchange || 'NSE',
          sector: sh.sector || 'Other',
          entity: sh.entity,
          qty: sh.qty,
          avgPrice: sh.avgPrice,
          cmp: sh.cmp,
          dividendFY: sh.dividendFY || 0,
          taxType: sh.taxType || 'LTCG',
        })),
        skipDuplicates: true,
      })
    }

    // Import settings
    if (settings) {
      for (const [key, value] of Object.entries(settings)) {
        await db.appSettings.create({
          data: { key, value: String(value) },
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Data imported successfully',
      counts: {
        accounts: accounts?.length || 0,
        fixedDeposits: fixedDeposits?.length || 0,
        transactions: transactions?.length || 0,
        mfHoldings: mfHoldings?.length || 0,
        shareHoldings: shareHoldings?.length || 0,
      }
    })
  } catch (error) {
    console.error('Error importing data:', error)
    return NextResponse.json({ error: 'Failed to import data' }, { status: 500 })
  }
}

// DELETE - Reset all data and optionally re-seed demo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const seedDemo = searchParams.get('seedDemo') === 'true'

    if (type === 'all') {
      await Promise.all([
        db.transaction.deleteMany(),
        db.fixedDeposit.deleteMany(),
        db.account.deleteMany(),
        db.mFHolding.deleteMany(),
        db.shareHolding.deleteMany(),
      ])

      if (seedDemo) {
        // Re-seed with demo data
        const demoAccounts = [
          { id: 'sbi_savings', bank: 'SBI', name: 'Savings Account', entity: 'personal', balance: 285000, monthlyInflow: 188200, monthlyOutflow: 124600, isAutoFD: false },
          { id: 'bob_savings', bank: 'Bank of Baroda', name: 'Savings Account', entity: 'personal', balance: 142000, monthlyInflow: 82000, monthlyOutflow: 65400, isAutoFD: false },
          { id: 'idfc_personal', bank: 'IDFC FIRST Bank', name: 'Personal Savings', entity: 'personal', balance: 423000, monthlyInflow: 245000, monthlyOutflow: 198500, isAutoFD: false },
          { id: 'idfc_child', bank: 'IDFC FIRST Bank', name: 'Child Savings', entity: 'personal', balance: 95000, monthlyInflow: 36250, monthlyOutflow: 0, isAutoFD: false },
          { id: 'idfc_huf', bank: 'IDFC FIRST Bank', name: 'HUF Savings', entity: 'huf', balance: 187000, monthlyInflow: 75000, monthlyOutflow: 0, isAutoFD: false },
          { id: 'idfc_firm', bank: 'IDFC FIRST Bank', name: 'Firm Current Account', entity: 'firm', balance: 845000, monthlyInflow: 420000, monthlyOutflow: 200000, isAutoFD: true },
        ]

        const demoFDs = [
          { id: 'fd_child', accountId: 'idfc_child', entity: 'personal', principal: 500000, rate: 7.25, startDate: '03 Apr 2025', maturityDate: '03 Apr 2026', maturityAmount: 536250, daysLeft: 13, tdsExpected: 7219, isAutoFD: false, status: 'maturing' },
          { id: 'fd_huf', accountId: 'idfc_huf', entity: 'huf', principal: 1000000, rate: 7.50, startDate: '15 Jun 2025', maturityDate: '15 Jun 2026', maturityAmount: 1075000, daysLeft: 86, tdsExpected: 18750, isAutoFD: false, status: 'active' },
          { id: 'fd_firm', accountId: 'idfc_firm', entity: 'firm', principal: 1500000, rate: 6.80, startDate: '10 Jan 2026', maturityDate: '10 Jul 2026', maturityAmount: 1551000, daysLeft: 111, tdsExpected: 0, isAutoFD: true, status: 'active' },
        ]

        const demoMF = [
          { id: 'mf1', name: 'Parag Parikh Flexi Cap Fund', amc: 'PPFAS', category: 'Flexi Cap', entity: 'personal', units: 245.678, avgNAV: 62.15, currentNAV: 82.45, xirr: 22.4, taxType: 'LTCG' },
          { id: 'mf2', name: 'Mirae Asset Large Cap Fund', amc: 'Mirae Asset', category: 'Large Cap', entity: 'personal', units: 1205.340, avgNAV: 84.76, currentNAV: 105.23, xirr: 16.8, taxType: 'LTCG' },
          { id: 'mf3', name: 'SBI Small Cap Fund', amc: 'SBI MF', category: 'Small Cap', entity: 'huf', units: 456.780, avgNAV: 154.28, currentNAV: 198.45, xirr: 19.2, taxType: 'LTCG' },
          { id: 'mf4', name: 'HDFC Mid Cap Opportunities', amc: 'HDFC MF', category: 'Mid Cap', entity: 'huf', units: 789.120, avgNAV: 115.32, currentNAV: 145.67, xirr: 14.1, taxType: 'LTCG' },
        ]

        const demoShares = [
          { id: 'sh1', symbol: 'INFY', company: 'Infosys Ltd', exchange: 'NSE', sector: 'IT', entity: 'personal', qty: 50, avgPrice: 1450, cmp: 1685, dividendFY: 6400, taxType: 'LTCG' },
          { id: 'sh2', symbol: 'TCS', company: 'Tata Consultancy Services', exchange: 'NSE', sector: 'IT', entity: 'personal', qty: 25, avgPrice: 3200, cmp: 3845, dividendFY: 5500, taxType: 'LTCG' },
          { id: 'sh3', symbol: 'HDFCBANK', company: 'HDFC Bank Ltd', exchange: 'NSE', sector: 'Banking', entity: 'personal', qty: 100, avgPrice: 1450, cmp: 1720, dividendFY: 7200, taxType: 'LTCG' },
          { id: 'sh4', symbol: 'RELIANCE', company: 'Reliance Industries Ltd', exchange: 'NSE', sector: 'Energy', entity: 'personal', qty: 30, avgPrice: 2200, cmp: 2890, dividendFY: 3300, taxType: 'STCG' },
        ]

        await db.account.createMany({ data: demoAccounts, skipDuplicates: true })
        await db.fixedDeposit.createMany({ data: demoFDs, skipDuplicates: true })
        await db.mFHolding.createMany({ data: demoMF, skipDuplicates: true })
        await db.shareHolding.createMany({ data: demoShares, skipDuplicates: true })
      }
    } else if (type === 'transactions') {
      await db.transaction.deleteMany()
    } else if (type === 'mf') {
      await db.mFHolding.deleteMany()
    } else if (type === 'shares') {
      await db.shareHolding.deleteMany()
    }

    return NextResponse.json({ success: true, message: `${type} data reset successfully` })
  } catch (error) {
    console.error('Error resetting data:', error)
    return NextResponse.json({ error: 'Failed to reset data' }, { status: 500 })
  }
}
