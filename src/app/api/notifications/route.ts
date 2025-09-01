import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authorization = request.headers.get('authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authorization.replace('Bearer ', '');
    let userId: string;
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get recent activities for notifications
    const [recentUploads, recentTrainingMaterials] = await Promise.all([
      // Recent upload sessions (completed)
      prisma.uploadSession.findMany({
        where: { 
          userId,
          status: 'COMPLETED',
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      
      // Recent training materials
      prisma.trainingMaterial.findMany({
        where: { 
          userId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        include: {
          product: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Transform to notification format
    const notifications = [];

    // Add upload notifications
    recentUploads.forEach(upload => {
      const timeAgo = getTimeAgo(upload.createdAt);
      notifications.push({
        id: `upload-${upload.id}`,
        title: 'Product Upload Complete',
        message: `${upload.filename} has been processed successfully`,
        type: 'completed',
        timestamp: timeAgo,
        isRead: false, // In a real app, you'd track read status
        createdAt: upload.createdAt
      });
    });

    // Add training material notifications
    recentTrainingMaterials.forEach(material => {
      const timeAgo = getTimeAgo(material.createdAt);
      const materialType = material.type.toLowerCase().replace('_', ' ');
      notifications.push({
        id: `material-${material.id}`,
        title: 'Sales Materials Ready',
        message: `${material.product?.name} ${materialType} is now ready for your team`,
        type: 'completed',
        timestamp: timeAgo,
        isRead: false,
        createdAt: material.createdAt
      });
    });

    // Sort by creation date (newest first) and limit to 10
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const limitedNotifications = notifications.slice(0, 10);

    return NextResponse.json({
      notifications: limitedNotifications,
      unreadCount: limitedNotifications.filter(n => !n.isRead).length
    });

  } catch (error: any) {
    console.error('Notifications error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
}