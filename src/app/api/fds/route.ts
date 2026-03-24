import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all fixed deposits
export async function GET() {
  try {
    const fds = await db.fixedDeposit.findMany({
      include: {
        account: true,
      },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(fds)
  } catch (error) {
    console.error('Error fetching FDs:', error)
    return NextResponse.json({ error: 'Failed to fetch fixed deposits' }, { status: 500 })
  }
}

// POST create new fixed deposit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      accountId,
      entity,
      principal,
      rate,
      startDate,
      maturityDate,
      maturityAmount,
      daysLeft,
      tdsExpected,
      isAutoFD,
      status,
    } = body

    const fd = await db.fixedDeposit.create({
      data: {
        id: id || undefined,
        accountId,
        entity: entity || 'personal',
        principal: principal || 0,
        rate: rate || 0,
        startDate: startDate || '',
        maturityDate: maturityDate || '',
        maturityAmount: maturityAmount || 0,
        daysLeft: daysLeft || 0,
        tdsExpected: tdsExpected || 0,
        isAutoFD: isAutoFD || false,
        status: status || 'active',
      },
      include: {
        account: true,
      },
    })

    return NextResponse.json(fd, { status: 201 })
  } catch (error) {
    console.error('Error creating FD:', error)
    return NextResponse.json({ error: 'Failed to create fixed deposit' }, { status: 500 })
  }
}

// PUT update fixed deposit
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'FD ID is required' }, { status: 400 })
    }

    const fd = await db.fixedDeposit.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        account: true,
      },
    })

    return NextResponse.json(fd)
  } catch (error) {
    console.error('Error updating FD:', error)
    return NextResponse.json({ error: 'Failed to update fixed deposit' }, { status: 500 })
  }
}

// DELETE fixed deposit
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'FD ID is required' }, { status: 400 })
    }

    await db.fixedDeposit.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting FD:', error)
    return NextResponse.json({ error: 'Failed to delete fixed deposit' }, { status: 500 })
  }
}
