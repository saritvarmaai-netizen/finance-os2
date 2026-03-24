import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all notifications
export async function GET() {
  try {
    const notifications = await db.notification.findMany({
      orderBy: [
        { isRead: 'asc' },
        { createdAt: 'desc' },
      ],
    })
    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

// POST create new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, type, title, body: notificationBody, priority, isRead } = body

    const notification = await db.notification.create({
      data: {
        id: id || undefined,
        type: type || 'info',
        title: title || '',
        body: notificationBody || '',
        priority: priority || 'normal',
        isRead: isRead || false,
      },
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}

// PUT mark notification as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, isRead } = body

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 })
    }

    const notification = await db.notification.update({
      where: { id },
      data: { isRead: isRead !== undefined ? isRead : true },
    })

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}

// DELETE notification
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 })
    }

    await db.notification.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 })
  }
}
