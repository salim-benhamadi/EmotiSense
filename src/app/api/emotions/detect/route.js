import { NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth.js';
import { detectEmotions } from '../../../../lib/openai.js';

export async function POST(request) {
  try {
    const user = await requireAuth(request);
    const { text } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required for emotion detection' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text is too long. Please limit to 5000 characters.' },
        { status: 400 }
      );
    }

    const emotionData = await detectEmotions(text);

    return NextResponse.json({
      success: true,
      data: {
        ...emotionData,
        processedAt: new Date().toISOString(),
        textLength: text.length
      }
    });

  } catch (error) {
    console.error('Emotion detection error:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to detect emotions. Please try again.' },
      { status: 500 }
    );
  }
}