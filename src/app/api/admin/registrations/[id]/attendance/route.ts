import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const client = new MongoClient(uri);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAttended } = await request.json();
    const { id } = await params;
    
    if (typeof isAttended !== 'boolean') {
      return NextResponse.json(
        { message: 'isAttended must be a boolean value' },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db(process.env.DATABASE_NAME || 'jana-ojana-jigisha');
    const collection = db.collection('registrations');

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isAttended } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Attendance status updated successfully', isAttended },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating attendance status:', error);
    return NextResponse.json(
      { message: 'Failed to update attendance status' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

