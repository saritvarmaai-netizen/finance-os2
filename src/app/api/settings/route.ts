import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all settings or specific setting by key
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key) {
      const setting = await db.appSettings.findUnique({
        where: { key },
      })
      if (!setting) {
        return NextResponse.json({ error: 'Setting not found' }, { status: 404 })
      }
      return NextResponse.json(setting)
    }

    const settings = await db.appSettings.findMany({
      orderBy: { key: 'asc' },
    })

    // Convert to object format for easier use
    const settingsObj = settings.reduce((acc, s) => {
      acc[s.key] = s.value
      return acc
    }, {} as Record<string, string>)

    return NextResponse.json(settingsObj)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PUT update setting
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value } = body

    if (!key) {
      return NextResponse.json({ error: 'Setting key is required' }, { status: 400 })
    }

    const setting = await db.appSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })

    return NextResponse.json(setting)
  } catch (error) {
    console.error('Error updating setting:', error)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}

// POST create new setting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value } = body

    if (!key) {
      return NextResponse.json({ error: 'Setting key is required' }, { status: 400 })
    }

    const existing = await db.appSettings.findUnique({
      where: { key },
    })

    if (existing) {
      return NextResponse.json({ error: 'Setting already exists' }, { status: 400 })
    }

    const setting = await db.appSettings.create({
      data: { key, value: value || '' },
    })

    return NextResponse.json(setting, { status: 201 })
  } catch (error) {
    console.error('Error creating setting:', error)
    return NextResponse.json({ error: 'Failed to create setting' }, { status: 500 })
  }
}

// DELETE setting
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json({ error: 'Setting key is required' }, { status: 400 })
    }

    await db.appSettings.delete({
      where: { key },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting setting:', error)
    return NextResponse.json({ error: 'Failed to delete setting' }, { status: 500 })
  }
}
