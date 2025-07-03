import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 3, // 5 requests
  duration: 60, // per 60 seconds (1 minute)
});

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const r2AccountId = process.env.R2_ACCOUNT_ID;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const r2BucketName = process.env.R2_BUCKET_NAME;
const publicUrl = process.env.PUBLIC_CLOUDFLARE_R2_URL;

if (!r2AccountId || !r2AccessKeyId || !r2SecretAccessKey || !r2BucketName) {
  throw new Error('Please define all R2 environment variables: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME');
}

const client = new MongoClient(uri);

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey,
  },
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  try {
    await rateLimiter.consume(ip);
  } catch (error) {
    return NextResponse.json({ message: 'Too Many Requests' }, { status: 429 });
  }

  try {
    const formData = await request.formData();

    const idCard = formData.get('idCard') as File;

    if (!idCard) {
      return NextResponse.json({ message: 'ID Card is required.' }, { status: 400 });
    }

    const data = {
      studentName: formData.get('studentName') as string,
      schoolName: formData.get('schoolName') as string,
      mobileNumber: formData.get('mobileNumber') as string,
      altMobileNumber: formData.get('altMobileNumber') as string,
      class: formData.get('class') as string,
      dob: formData.get('dob') as string,
      email: formData.get('email') as string,
    };

    await client.connect();
    const db = client.db(process.env.DATABASE_NAME || 'jana-ojana-jigisha');
    const collection = db.collection('registrations');

    const existingEntry = await collection.findOne({
      studentName: data.studentName,
      schoolName: data.schoolName,
      class: data.class,
      dob: data.dob,
    });

    if (existingEntry) {
      return NextResponse.json(
        { message: 'This entry seems to be a duplicate. Please contact the co-ordinators.' },
        { status: 409 }
      );
    }

    const idCardBuffer = Buffer.from(await idCard.arrayBuffer());
    const idCardKey = `id-cards/${Date.now()}-${idCard.name}`;

    await r2.send(
      new PutObjectCommand({
        Bucket: r2BucketName,
        Key: idCardKey,
        Body: idCardBuffer,
        ContentType: idCard.type,
      })
    );

    const idCardUrl = `${publicUrl}/${idCardKey}`;

    const result = await collection.insertOne({ ...data, idCardUrl });

    return NextResponse.json(
      { message: 'Registration successful!', data: { ...data, _id: result.insertedId } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration failed:', error);
    return NextResponse.json({ message: 'Registration failed.' }, { status: 500 });
  } finally {
    await client.close();
  }
} 