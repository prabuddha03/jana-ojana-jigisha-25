import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    return client.db(process.env.DATABASE_NAME || 'jana-ojana-jigisha');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('registrations');

    // Get all registrations
    const allRegistrations = await collection.find({}).toArray();

    // Calculate total participants
    const totalParticipants = allRegistrations.length;

    // Calculate unique schools (normalized - lowercase and trimmed)
    const uniqueSchools = new Set();
    allRegistrations.forEach(reg => {
      const normalizedSchool = reg.schoolName.toLowerCase().trim();
      uniqueSchools.add(normalizedSchool);
    });
    const totalSchools = uniqueSchools.size;

    // Calculate class-wise counts
    const classCounts: { [key: string]: number } = {};
    allRegistrations.forEach(reg => {
      const className = reg.class;
      classCounts[className] = (classCounts[className] || 0) + 1;
    });

    // Calculate attendance statistics
    const attended = allRegistrations.filter(reg => reg.isAttended === true).length;
    const notAttended = allRegistrations.filter(reg => reg.isAttended === false).length;
    const attendanceRate = totalParticipants > 0 ? Math.round((attended / totalParticipants) * 100) : 0;

    // Calculate certificate statistics
    const issued = allRegistrations.filter(reg => reg.certificateIssued === true).length;
    const notIssued = allRegistrations.filter(reg => reg.certificateIssued === false).length;
    const issuanceRate = totalParticipants > 0 ? Math.round((issued / totalParticipants) * 100) : 0;

    return NextResponse.json({
      totalSchools,
      totalParticipants,
      classCounts,
      attendanceStats: {
        attended,
        notAttended,
        attendanceRate
      },
      certificateStats: {
        issued,
        notIssued,
        issuanceRate
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ message: 'Error fetching statistics' }, { status: 500 });
  }
} 