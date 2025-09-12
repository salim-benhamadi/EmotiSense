import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { requireAuth } from '../../../../lib/auth.js';
import { getLogsCollection } from '../../../../lib/mongodb.js';

export async function GET(request, { params }) {
  try {
    const user = await requireAuth(request);
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid log ID' },
        { status: 400 }
      );
    }

    const logs = await getLogsCollection();
    const log = await logs.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(user._id)
    });

    if (!log) {
      return NextResponse.json(
        { error: 'Log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...log,
        id: log._id.toString(),
        userId: log.userId.toString(),
        _id: undefined
      }
    });

  } catch (error) {
    console.error('Get log error:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch log' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await requireAuth(request);
    const { id } = params;
    const updateData = await request.json();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid log ID' },
        { status: 400 }
      );
    }

    const logs = await getLogsCollection();
    
    const existingLog = await logs.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(user._id)
    });

    if (!existingLog) {
      return NextResponse.json(
        { error: 'Log not found' },
        { status: 404 }
      );
    }

    const allowedUpdates = ['questionnaire', 'chatSession'];
    const filteredUpdate = {};
    
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredUpdate[field] = updateData[field];
      }
    });

    filteredUpdate.updatedAt = new Date();

    const result = await logs.updateOne(
      { _id: new ObjectId(id) },
      { $set: filteredUpdate }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'No changes made' },
        { status: 400 }
      );
    }

    const updatedLog = await logs.findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedLog,
        id: updatedLog._id.toString(),
        userId: updatedLog.userId.toString(),
        _id: undefined
      }
    });

  } catch (error) {
    console.error('Update log error:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update log' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await requireAuth(request);
    const { id } = params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid log ID' },
        { status: 400 }
      );
    }

    const logs = await getLogsCollection();
    
    const result = await logs.deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(user._id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Log deleted successfully'
    });

  } catch (error) {
    console.error('Delete log error:', error);
    
    if (error.message === 'Authentication required') {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete log' },
      { status: 500 }
    );
  }
}