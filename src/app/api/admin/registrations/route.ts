import { NextResponse } from 'next/server';
import { MongoClient, Sort } from 'mongodb';

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const classFilter = searchParams.get('class') || '';
  const sortBy = searchParams.get('sortBy') || 'studentName';
  const sortOrder = searchParams.get('sortOrder') || 'asc';

  try {
    const db = await connectToDatabase();
    const collection = db.collection('registrations');

    // Build query filter
    const filter: { [key: string]: unknown } = {};
    
    // Add search filter
    if (search) {
      filter.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { schoolName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Add class filter
    if (classFilter) {
      filter.class = classFilter;
    }

    // Build sort options
    const sortOptions: Sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Get total count for pagination
    const total = await collection.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Get paginated results
    const skip = (page - 1) * limit;
    const registrations = await collection
      .find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format the response
    const formattedRegistrations = registrations.map(reg => ({
      _id: reg._id.toString(),
      studentName: reg.studentName,
      schoolName: reg.schoolName,
      class: reg.class,
      dob: reg.dob,
      email: reg.email,
      mobileNumber: reg.mobileNumber,
      altMobileNumber: reg.altMobileNumber,
      idCardUrl: reg.idCardUrl
    }));

    return NextResponse.json({
      registrations: formattedRegistrations,
      total,
      page,
      totalPages,
      limit
    });

  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json({ message: 'Error fetching registrations' }, { status: 500 });
  }
} 