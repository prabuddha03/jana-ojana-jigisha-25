import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const data = {
      studentName: formData.get('studentName'),
      schoolName: formData.get('schoolName'),
      mobileNumber: formData.get('mobileNumber'),
      altMobileNumber: formData.get('altMobileNumber'),
      class: formData.get('class'),
      dob: formData.get('dob'),
      idCard: formData.get('idCard'), // This will be a File object
    };

    console.log('Received data:', data);

    // **DATABASE LOGIC HERE**
    // 1. Connect to MongoDB
    // 2. Upload the ID card to Cloudflare R2 and get the URL.
    // 3. Save the form data, including the ID card URL, to the database.

    // For now, just returning a success response
    return NextResponse.json({ message: 'Registration successful!', data }, { status: 201 });
  } catch (error) {
    console.error('Registration failed:', error);
    return NextResponse.json({ message: 'Registration failed.' }, { status: 500 });
  }
} 