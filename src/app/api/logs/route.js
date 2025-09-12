import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { requireAuth } from '../../../lib/auth.js';
import { getLogsCollection } from '../../../lib/mongodb.js';
import { detectEmotions } from '../../../lib/openai.js';

export async function POST(request) {
  try {
    const user = await requireAuth(request);
    const { text, date } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const emotionData = await detectEmotions(text);
    
    const logs = await getLogsCollection();
    
    const newLog = {
      userId: new ObjectId(user._id),
      date: date ? new Date(date) : new Date(),
      userText: text.trim(),
      detectedEmotions: emotionData.primaryEmotions || [],
      emotionMetadata: {
        intensity: emotionData.intensity || 0,
        complexity: emotionData.complexity || 'simple',
        sensoryElements: emotionData.sensoryElements || [],
        cognitivePatterns: emotionData.cognitivePatterns || []
      },
      questionnaire: null,
      chatSession: {
        messages: [],
        patterns: [],
        insights: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await logs.insertOne(newLog);
    
    return NextResponse.json({
      success: true,
      data: {
        id: result.insertedId.toString(),
        ...newLog,
        userId: user._id.toString()
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create log error:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create log entry' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const logs = await getLogsCollection();
    
    const query = { userId: new ObjectId(user._id) };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const totalCount = await logs.countDocuments(query);
    
    const userLogs = await logs
      .find(query)
      .sort({ date: -1, createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    const formattedLogs = userLogs.map(log => ({
      ...log,
      id: log._id.toString(),
      userId: log.userId.toString(),
      _id: undefined
    }));

    return NextResponse.json({
      success: true,
      data: {
        logs: formattedLogs,
        pagination: {
          total: totalCount,
          limit,
          offset,
          hasMore: offset + limit < totalCount
        }
      }
    });

  } catch (error) {
    console.error('Get logs error:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}