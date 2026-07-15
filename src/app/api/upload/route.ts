import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads
    // Using a simple timestamp + random string to avoid name collisions
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Ensure dir exists
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const path = join(uploadDir, fileName);
    await writeFile(path, buffer);

    // Return the public URL
    return NextResponse.json({ url: `/uploads/${fileName}` });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
