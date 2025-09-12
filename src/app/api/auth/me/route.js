import { NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth.js';

export async function GET(request) {
  try {
    const user = await requireAuth(request);

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        preferences: user.preferences,
        tas20Score: user.tas20Score
      }
    });

  } catch (error) {
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}