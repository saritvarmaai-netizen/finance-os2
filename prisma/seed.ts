import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Read the db.json file
const dbJsonPath = path.join(__dirname, '../src/lib/db.json')
const dbJson = JSON.parse(fs.readFileSync(dbJsonPath, 'utf-8'))

async function main() {
  console.log('🌱 Starting seed...')
  
  // Clear existing data first
  console.log('🗑️  Clearing existing data...')
  await prisma.transaction.deleteMany()
  await prisma.fixedDeposit.deleteMany()
  await prisma.account.deleteMany()
  await prisma.mFHolding.deleteMany()
  await prisma.shareHolding.deleteMany()
  await prisma.appSettings.deleteMany()
  console.log('✅ Existing data cleared')

  // Seed Accounts
  console.log('📊 Seeding accounts...')
  for (const account of dbJson.accounts) {
    await prisma.account.create({
      data: {
        id: account.id,
        bank: account.bank,
        name: account.name,
        entity: account.entity,
        balance: account.balance,
        monthlyInflow: account.monthlyInflow || 0,
        monthlyOutflow: account.monthlyOutflow || 0,
        isAutoFD: account.isAutoFD || false,
        isClubbed: account.isClubbed || false,
      }
    })
  }
  console.log(`✅ ${dbJson.accounts.length} accounts seeded`)

  // Seed Fixed Deposits
  console.log('🏦 Seeding fixed deposits...')
  for (const fd of dbJson.fixedDeposits) {
    await prisma.fixedDeposit.create({
      data: {
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
      }
    })
  }
  console.log(`✅ ${dbJson.fixedDeposits.length} fixed deposits seeded`)

  // Seed Transactions
  console.log('💰 Seeding transactions...')
  for (const tx of dbJson.transactions) {
    await prisma.transaction.create({
      data: {
        id: tx.id,
        date: tx.date,
        description: tx.description,
        account: tx.account,
        category: tx.category,
        debit: tx.debit || 0,
        credit: tx.credit || 0,
        entity: tx.entity,
        aiConfidence: tx.aiConfidence || 100,
        isTransfer: tx.isTransfer || false,
      }
    })
  }
  console.log(`✅ ${dbJson.transactions.length} transactions seeded`)

  // Seed MF Holdings
  console.log('📈 Seeding mutual fund holdings...')
  for (const mf of dbJson.mfHoldings) {
    await prisma.mFHolding.create({
      data: {
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
      }
    })
  }
  console.log(`✅ ${dbJson.mfHoldings.length} MF holdings seeded`)

  // Seed Share Holdings
  console.log('📊 Seeding share holdings...')
  for (const sh of dbJson.shareHoldings) {
    await prisma.shareHolding.create({
      data: {
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
      }
    })
  }
  console.log(`✅ ${dbJson.shareHoldings.length} share holdings seeded`)

  // Seed Settings (LTCG)
  console.log('⚙️  Seeding settings...')
  await prisma.appSettings.create({
    data: { key: 'ltcgBooked', value: String(dbJson.ltcgBooked || 0) }
  })
  await prisma.appSettings.create({
    data: { key: 'ltcgLimit', value: String(dbJson.ltcgLimit || 125000) }
  })
  console.log('✅ Settings seeded')

  console.log('\n🎉 Seed completed successfully!')
  console.log('Summary:')
  console.log(`  - Accounts: ${dbJson.accounts.length}`)
  console.log(`  - Fixed Deposits: ${dbJson.fixedDeposits.length}`)
  console.log(`  - Transactions: ${dbJson.transactions.length}`)
  console.log(`  - MF Holdings: ${dbJson.mfHoldings.length}`)
  console.log(`  - Share Holdings: ${dbJson.shareHoldings.length}`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
