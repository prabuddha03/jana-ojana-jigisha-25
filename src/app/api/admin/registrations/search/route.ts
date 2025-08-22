import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const client = new MongoClient(uri);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    console.log('Search query received:', query);

    if (!query || query.trim().length === 0) {
      console.log('Empty query, returning empty results');
      return NextResponse.json({ registrations: [] });
    }

    await client.connect();
    const db = client.db(process.env.DATABASE_NAME || 'jana-ojana-jigisha');
    const collection = db.collection('registrations');

    // First, let's check if we have any registrations at all
    const totalCount = await collection.countDocuments({});
    console.log('Total registrations in database:', totalCount);

    // Create a case-insensitive search query
    const searchQuery = {
      $or: [
        { studentName: { $regex: query, $options: 'i' } },
        { schoolName: { $regex: query, $options: 'i' } },
        { mobileNumber: { $regex: query, $options: 'i' } },
        { altMobileNumber: { $regex: query, $options: 'i' } },
      ]
    };

    console.log('Search query:', JSON.stringify(searchQuery, null, 2));

    const registrations = await collection
      .find(searchQuery)
      .project({
        _id: 1,
        studentName: 1,
        schoolName: 1,
        class: 1,
        mobileNumber: 1,
        altMobileNumber: 1,
        idCardUrl: 1,
        isAttended: 1,
      })
      .limit(50) // Limit results to prevent overwhelming the UI
      .toArray();

    console.log('Found registrations:', registrations.length);
    console.log('First few results:', registrations.slice(0, 2));

    return NextResponse.json({ registrations });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { message: 'Search failed' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
