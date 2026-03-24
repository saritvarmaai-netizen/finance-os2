import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all transactions
export async function GET() {
  try {
    const transactions = await db.transaction.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

// POST create new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      date,
      description,
      account,
      category,
      debit,
      credit,
      entity,
      aiConfidence,
      isTransfer,
    } = body

    const transaction = await db.transaction.create({
      data: {
        id: id || undefined,
        date: date || '',
        description: description || '',
        account: account || '',
        category: category || '',
        debit: debit || 0,
        credit: credit || 0,
        entity: entity || 'personal',
        aiConfidence: aiConfidence || 0,
        isTransfer: isTransfer || false,
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}

// DELETE transaction
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 })
    }

    await db.transaction.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
  }
}
