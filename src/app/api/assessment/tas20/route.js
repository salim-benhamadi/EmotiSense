import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { requireAuth } from '../../../../lib/auth.js';
import { getAssessmentsCollection, getUserCollection } from '../../../../lib/mongodb.js';

export async function POST(request) {
  try {
    const user = await requireAuth(request);
    const { responses, results } = await request.json();    

    if (!responses || !results) {
      return NextResponse.json(
        { error: 'Assessment responses and results are required' },
        { status: 400 }
      );
    }

    // Validate that all 20 questions are answered
    if (Object.keys(responses).length !== 20) {
      return NextResponse.json(
        { error: 'All 20 questions must be answered' },
        { status: 400 }
      );
    }

    const assessments = await getAssessmentsCollection();
    
    const assessment = {
      userId: new ObjectId(user._id),
      type: 'TAS-20',
      responses,
      results: {
        totalScore: results.totalScore,
        difScore: results.difScore,
        ddfScore: results.ddfScore,
        eotScore: results.eotScore,
        interpretation: results.interpretation,
        completedAt: new Date(results.completedAt)
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await assessments.insertOne(assessment);

    // Update user's TAS-20 score - FIXED: Initialize the entire object
    const users = await getUserCollection();
    await users.updateOne(
      { _id: new ObjectId(user._id) },
      { 
        $set: { 
          tas20Score: {  // Set the entire object instead of nested properties
            score: results.totalScore,
            subscores: {
              dif: results.difScore,
              ddf: results.ddfScore,
              eot: results.eotScore
            },
            interpretation: results.interpretation,
            takenAt: new Date(results.completedAt)
          }
        }
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        id: result.insertedId.toString(),
        ...assessment,
        userId: user._id.toString()
      }
    }, { status: 201 });

  } catch (error) {
    console.error('TAS-20 assessment error:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to save assessment' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const user = await requireAuth(request);
    const assessments = await getAssessmentsCollection();
    
    const userAssessments = await assessments
      .find({ 
        userId: new ObjectId(user._id),
        type: 'TAS-20'
      })
      .sort({ createdAt: -1 })
      .toArray();

    const formattedAssessments = userAssessments.map(assessment => ({
      ...assessment,
      id: assessment._id.toString(),
      userId: assessment.userId.toString(),
      _id: undefined
    }));

    return NextResponse.json({
      success: true,
      data: {
        assessments: formattedAssessments,
        latest: formattedAssessments[0] || null
      }
    });

  } catch (error) {
    console.error('Get TAS-20 assessments error:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}