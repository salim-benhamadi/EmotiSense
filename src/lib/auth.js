// lib/auth.js - Updated for Next.js App Router
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { getUserCollection } from './mongodb.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function hashPassword(password) {
  return await bcryptjs.hash(password, 12);
}

export async function verifyPassword(password, hashedPassword) {
  return await bcryptjs.compare(password, hashedPassword);
}

export function generateToken(userId) {
  return jwt.sign(
    { userId, iat: Date.now() },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function getUserFromToken(token) {
  if (!token) return null;
  
  const decoded = verifyToken(token);
  if (!decoded) return null;
  
  try {
    const users = await getUserCollection();
    const user = await users.findOne({ _id: new ObjectId(decoded.userId) });
    return user;
  } catch (error) {
    return null;
  }
}

// FIXED: Updated for Next.js App Router Request object
export function getTokenFromRequest(request) {
  // Method 1: Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Method 2: Cookie header
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const tokenCookie = cookieHeader.split(';').find(c => c.trim().startsWith('token='));
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
  }
  
  return null;
}

// FIXED: Updated parameter name to match Next.js conventions
export async function requireAuth(request) {
  const token = getTokenFromRequest(request);
  console.log('Token extracted:', !!token); // Debug log
  
  if (!token) {
    console.log('No token found in request');
    throw new Error('Authentication required');
  }
  
  const user = await getUserFromToken(token);
  console.log('User found:', !!user); // Debug log
  
  if (!user) {
    console.log('No user found for token');
    throw new Error('Authentication required');
  }
  
  return user;
}

export function createAuthCookie(token) {
  return `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
}