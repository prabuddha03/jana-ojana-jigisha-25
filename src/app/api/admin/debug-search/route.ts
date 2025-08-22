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
    const query = searchParams.get('q') || 'test';

    console.log('=== DEBUG SEARCH START ===');
    console.log('Search query:', query);
    console.log('MongoDB URI exists:', !!uri);
    console.log('Database name:', process.env.DATABASE_NAME || 'jana-ojana-jigisha');

    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(process.env.DATABASE_NAME || 'jana-ojana-jigisha');
    console.log('Database selected:', db.databaseName);

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    const collection = db.collection('registrations');
    console.log('Using collection: registrations');

    // Get total count
    const totalCount = await collection.countDocuments({});
    console.log('Total registrations:', totalCount);

    if (totalCount === 0) {
      console.log('No registrations found in database');
      return NextResponse.json({
        debug: {
          message: 'No registrations in database',
          totalCount,
          collections: collections.map(c => c.name)
        }
      });
    }

    // Get a sample registration
    const sample = await collection.findOne({});
    console.log('Sample registration fields:', Object.keys(sample || {}));
    console.log('Sample registration:', sample);

    // Try the search query
    const searchQuery = {
      $or: [
        { studentName: { $regex: query, $options: 'i' } },
        { schoolName: { $regex: query, $options: 'i' } },
        { mobileNumber: { $regex: query, $options: 'i' } },
        { altMobileNumber: { $regex: query, $options: 'i' } },
      ]
    };

    console.log('Search query:', JSON.stringify(searchQuery, null, 2));

    const results = await collection.find(searchQuery).limit(5).toArray();
    console.log('Search results count:', results.length);
    console.log('Search results:', results);

    console.log('=== DEBUG SEARCH END ===');

    return NextResponse.json({
      debug: {
        query,
        totalCount,
        collections: collections.map(c => c.name),
        sampleFields: Object.keys(sample || {}),
        searchResultsCount: results.length,
        searchResults: results
      }
    });

  } catch (error) {
    console.error('Debug search error:', error);
    return NextResponse.json(
      { 
        debug: { 
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        }
      },
      { status: 500 }
    );
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

