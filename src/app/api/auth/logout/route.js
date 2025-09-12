import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear the authentication cookie
    response.headers.set(
      'Set-Cookie',
      'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict'
    );

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}