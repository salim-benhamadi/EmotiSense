import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { requireAuth } from '../../../../lib/auth.js';
import { getLogsCollection, getPatternsCollection } from '../../../../lib/mongodb.js';
import { generateQuestions } from '../../../../lib/openai.js';

export async function POST(request) {
  try {
    const user = await requireAuth(request);
    const { logId } = await request.json();

    if (!logId || !ObjectId.isValid(logId)) {
      return NextResponse.json(
        { error: 'Valid log ID is required' },
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

    const patterns = await getPatternsCollection();
    const userPatterns = await patterns
      .find({ userId: new ObjectId(user._id) })
      .limit(5)
      .toArray();

    const logData = {
      userText: log.userText,
      emotions: log.detectedEmotions,
      metadata: log.emotionMetadata
    };

    const questionsData = await generateQuestions(logData, userPatterns);

    const defaultQuestions = {
      questions: [
        {
          id: 'metaphor',
          type: 'open',
          text: 'If your feelings today were a color, weather, or texture, how would you describe them?',
          category: 'metaphor',
          required: false
        },
        {
          id: 'physical',
          type: 'checkbox',
          text: 'Did you notice any physical sensations? (Select all that apply)',
          options: [
            'Tension in shoulders/neck',
            'Stomach changes',
            'Heart rate changes',
            'Breathing changes',
            'Temperature changes',
            'Energy level changes',
            'Sleep changes',
            'Other sensations'
          ],
          category: 'physical',
          required: false
        },
        {
          id: 'intensity',
          type: 'scale',
          text: 'How intense was your overall experience today?',
          scale: { min: 1, max: 10, labels: { 1: 'Very mild', 10: 'Very intense' } },
          category: 'intensity',
          required: false
        },
        {
          id: 'context',
          type: 'open',
          text: 'What was happening around you when you noticed these feelings?',
          category: 'context',
          required: false
        },
        {
          id: 'patterns',
          type: 'radio',
          text: 'Does this experience remind you of anything similar from recent days?',
          options: ['Yes, very similar', 'Somewhat similar', 'Not really', 'Completely new'],
          category: 'patterns',
          required: false
        },
        {
          id: 'needs',
          type: 'checkbox',
          text: 'What might have been helpful in this situation? (Select all that apply)',
          options: [
            'More time to process',
            'Quieter environment',
            'Different lighting',
            'Someone to talk to',
            'Time alone',
            'Physical movement',
            'Something comforting',
            'Different activity'
          ],
          category: 'needs',
          required: false
        }
      ]
    };

    const questions = questionsData.questions && questionsData.questions.length > 0 
      ? questionsData 
      : defaultQuestions;

    return NextResponse.json({
      success: true,
      data: {
        logId,
        questions: questions.questions,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Generate questions error:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}