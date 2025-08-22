import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    const db = client.db(process.env.DATABASE_NAME || 'jana-ojana-jigisha');
    const collection = db.collection('registrations');

    // Get total count
    const totalCount = await collection.countDocuments({});
    
    // Get a sample registration to see the structure
    const sampleRegistration = await collection.findOne({});
    
    // Get count by attendance status
    const attendedCount = await collection.countDocuments({ isAttended: true });
    const notAttendedCount = await collection.countDocuments({ isAttended: false });
    
    // Get count by certificate status
    const certificateIssuedCount = await collection.countDocuments({ certificateIssued: true });
    const certificateNotIssuedCount = await collection.countDocuments({ certificateIssued: false });

    return NextResponse.json({
      success: true,
      totalCount,
      attendedCount,
      notAttendedCount,
      certificateIssuedCount,
      certificateNotIssuedCount,
      sampleRegistration: sampleRegistration ? {
        _id: sampleRegistration._id,
        studentName: sampleRegistration.studentName,
        schoolName: sampleRegistration.schoolName,
        isAttended: sampleRegistration.isAttended,
        certificateIssued: sampleRegistration.certificateIssued,
        hasCreatedAt: !!sampleRegistration.createdAt
      } : null
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        uri: uri ? 'URI exists' : 'No URI'
      },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

