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
    const updateData = await request.json();
    const { id } = await params;
    
    // Validate required fields
    const { studentName, mobileNumber } = updateData;
    
    if (!studentName || !mobileNumber) {
      return NextResponse.json(
        { message: 'Student name and mobile number are required' },
        { status: 400 }
      );
    }

    // Validate mobile number format (should start with +91)
    if (!mobileNumber.startsWith('+91 ')) {
      return NextResponse.json(
        { message: 'Mobile number should start with +91' },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db(process.env.DATABASE_NAME || 'jana-ojana-jigisha');
    const collection = db.collection('registrations');

    // Prepare update object with only the fields that can be updated
    const updateObject: {
      studentName: string;
      mobileNumber: string;
      altMobileNumber?: string;
    } = {
      studentName,
      mobileNumber
    };

    // Add altMobileNumber if provided
    if (updateData.altMobileNumber !== undefined) {
      updateObject.altMobileNumber = updateData.altMobileNumber;
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateObject }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Registration updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating registration:', error);
    return NextResponse.json(
      { message: 'Failed to update registration' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
