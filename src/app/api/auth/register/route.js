import { NextResponse } from 'next/server';
import { getUserCollection } from '../../../../lib/mongodb.js';
import { hashPassword, generateToken, createAuthCookie } from '../../../../lib/auth.js';

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const users = await getUserCollection();
    
    const existingUser = await users.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    
    const newUser = {
      email: email.toLowerCase(),
      name,
      passwordHash: hashedPassword,
      createdAt: new Date(),
      preferences: {
        timezone: 'UTC',
        notifications: true,
        privacy: {
          shareData: false,
          analytics: true
        }
      },
      tas20Score: null
    };

    const result = await users.insertOne(newUser);
    const userId = result.insertedId.toString();

    const token = generateToken(userId);
    
    const response = NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: userId,
          email: newUser.email,
          name: newUser.name
        }
      },
      { status: 201 }
    );

    response.headers.set('Set-Cookie', createAuthCookie(token));
    
    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}