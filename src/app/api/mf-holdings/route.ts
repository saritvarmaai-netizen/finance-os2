import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all MF holdings
export async function GET() {
  try {
    const mfHoldings = await db.mFHolding.findMany({
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json(mfHoldings)
  } catch (error) {
    console.error('Error fetching MF holdings:', error)
    return NextResponse.json({ error: 'Failed to fetch MF holdings' }, { status: 500 })
  }
}

// POST create new MF holding
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      name,
      amc,
      category,
      entity,
      units,
      avgNAV,
      currentNAV,
      xirr,
      taxType,
    } = body

    const mfHolding = await db.mFHolding.create({
      data: {
        id: id || undefined,
        name: name || '',
        amc: amc || '',
        category: category || '',
        entity: entity || 'personal',
        units: units || 0,
        avgNAV: avgNAV || 0,
        currentNAV: currentNAV || 0,
        xirr: xirr || 0,
        taxType: taxType || 'LTCG',
      },
    })

    return NextResponse.json(mfHolding, { status: 201 })
  } catch (error) {
    console.error('Error creating MF holding:', error)
    return NextResponse.json({ error: 'Failed to create MF holding' }, { status: 500 })
  }
}

// PUT update MF holding
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'MF Holding ID is required' }, { status: 400 })
    }

    const mfHolding = await db.mFHolding.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(mfHolding)
  } catch (error) {
    console.error('Error updating MF holding:', error)
    return NextResponse.json({ error: 'Failed to update MF holding' }, { status: 500 })
  }
}

// DELETE MF holding
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'MF Holding ID is required' }, { status: 400 })
    }

    await db.mFHolding.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting MF holding:', error)
    return NextResponse.json({ error: 'Failed to delete MF holding' }, { status: 500 })
  }
}
