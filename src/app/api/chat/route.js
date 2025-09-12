import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { requireAuth } from '../../../lib/auth.js';
import { getLogsCollection } from '../../../lib/mongodb.js';
import { getChatResponse } from '../../../lib/openai.js';

export async function POST(request) {
  try {
    const user = await requireAuth(request);
    const { logId, message, messages = [] } = await request.json();

    if (!logId || !ObjectId.isValid(logId)) {
      return NextResponse.json(
        { error: 'Valid log ID is required' },
        { status: 400 }
      );
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const logs = await getLogsCollection();
    const log = await logs.findOne({
      _id: new ObjectId(logId),
      userId: new ObjectId(user._id)
    });

    if (!log) {
      return NextResponse.json(
        { error: 'Log not found' },
        { status: 404 }
      );
    }

    const recentLogs = await logs
      .find({ 
        userId: new ObjectId(user._id),
        _id: { $ne: new ObjectId(logId) }
      })
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();

    const context = {
      userName: user.name,
      currentLog: {
        userText: log.userText,
        emotions: log.detectedEmotions,
        metadata: log.emotionMetadata
      },
      questionnaireData: log.questionnaire,
      relevantLogs: recentLogs.map(l => ({
        date: l.date,
        text: l.userText.substring(0, 200),
        emotions: l.detectedEmotions
      }))
    };

    const conversationMessages = [
      ...messages,
      { role: 'user', content: message }
    ];

    const aiResponse = await getChatResponse(conversationMessages, context);

    const newMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    };

    const updatedMessages = [...conversationMessages, newMessage];

    await logs.updateOne(
      { _id: new ObjectId(logId) },
      { 
        $set: { 
          'chatSession.messages': updatedMessages,
          'chatSession.lastActivity': new Date(),
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        message: newMessage,
        conversationId: logId
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}