import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all share holdings
export async function GET() {
  try {
    const shareHoldings = await db.shareHolding.findMany({
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(shareHoldings)
  } catch (error) {
    console.error('Error fetching share holdings:', error)
    return NextResponse.json({ error: 'Failed to fetch share holdings' }, { status: 500 })
  }
}

// POST create new share holding
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      symbol,
      company,
      exchange,
      sector,
      entity,
      qty,
      avgPrice,
      cmp,
      dividendFY,
      taxType,
    } = body

    const shareHolding = await db.shareHolding.create({
      data: {
        id: id || undefined,
        symbol: symbol || '',
        company: company || '',
        exchange: exchange || 'NSE',
        sector: sector || '',
        entity: entity || 'personal',
        qty: qty || 0,
        avgPrice: avgPrice || 0,
        cmp: cmp || 0,
        dividendFY: dividendFY || 0,
        taxType: taxType || 'LTCG',
      },
    })

    return NextResponse.json(shareHolding, { status: 201 })
  } catch (error) {
    console.error('Error creating share holding:', error)
    return NextResponse.json({ error: 'Failed to create share holding' }, { status: 500 })
  }
}

// PUT update share holding
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'Share Holding ID is required' }, { status: 400 })
    }

    const shareHolding = await db.shareHolding.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(shareHolding)
  } catch (error) {
    console.error('Error updating share holding:', error)
    return NextResponse.json({ error: 'Failed to update share holding' }, { status: 500 })
  }
}

// DELETE share holding
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Share Holding ID is required' }, { status: 400 })
    }

    await db.shareHolding.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting share holding:', error)
    return NextResponse.json({ error: 'Failed to delete share holding' }, { status: 500 })
  }
}
