import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all accounts
export async function GET() {
  try {
    const accounts = await db.account.findMany({
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
  }
}

// POST create new account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, bank, name, entity, balance, monthlyInflow, monthlyOutflow, isAutoFD } = body

    const account = await db.account.create({
      data: {
        id: id || undefined,
        bank,
        name,
        entity: entity || 'personal',
        balance: balance || 0,
        monthlyInflow: monthlyInflow || 0,
        monthlyOutflow: monthlyOutflow || 0,
        isAutoFD: isAutoFD || false,
      },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}

// PUT update account
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
    }

    const account = await db.account.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(account)
  } catch (error) {
    console.error('Error updating account:', error)
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 })
  }
}

// DELETE account
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
    }

    await db.account.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
