import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { validateProductImageUpload } from "@/lib/serverImageValidation";

const allowedUploadRoles = new Set(["SUPERADMIN", "UNIVERSITY_ADMIN"]);
const VERIFICATION_DOCUMENT_MAX_SIZE_BYTES = 10 * 1024 * 1024;
const verificationDocumentExtensionsByType = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "application/pdf": ".pdf",
} as const;

type VerificationDocumentType = keyof typeof verificationDocumentExtensionsByType;

function getSafeFileName(fileName: string, fallbackExtension?: string) {
  const extension = fallbackExtension || extname(fileName).toLowerCase();

  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;
}

function isVerificationDocumentType(type: string): type is VerificationDocumentType {
  return type in verificationDocumentExtensionsByType;
}

function validateVerificationDocumentUpload(file: File, buffer: Buffer) {
  if (!isVerificationDocumentType(file.type)) {
    return "Неподдерживаемый формат файла. Доступны: JPG, PNG, PDF.";
  }

  if (file.size > VERIFICATION_DOCUMENT_MAX_SIZE_BYTES) {
    return "Файл слишком большой. Максимальный размер: 10 МБ.";
  }

  const isPng =
    file.type === "image/png" &&
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47;

  const isJpeg =
    file.type === "image/jpeg" &&
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;

  const isPdf =
    file.type === "application/pdf" &&
    buffer.length >= 5 &&
    buffer.toString("ascii", 0, 5) === "%PDF-";

  if (!isPng && !isJpeg && !isPdf) {
    return "Не удалось проверить содержимое файла.";
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const purpose = formData.get("purpose");

    if (!file) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (purpose === "verification-document") {
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const validationError = validateVerificationDocumentUpload(file, buffer);

      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }

      const fileType = file.type;
      if (!isVerificationDocumentType(fileType)) {
        return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
      }

      const fileName = getSafeFileName(
        file.name,
        verificationDocumentExtensionsByType[fileType],
      );
      const uploadDir = join(process.cwd(), "public", "uploads", "verifications");

      await mkdir(uploadDir, { recursive: true });
      await writeFile(join(uploadDir, fileName), buffer);

      return NextResponse.json({ url: `/uploads/verifications/${fileName}` });
    }

    if (!session?.user || !allowedUploadRoles.has(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const validationError = validateProductImageUpload(file, buffer);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Save to public/uploads
    // Using a simple timestamp + random string to avoid name collisions
    const fileName = getSafeFileName(file.name);
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    await mkdir(uploadDir, { recursive: true });

    const path = join(uploadDir, fileName);
    await writeFile(path, buffer);

    // Return the public URL
    return NextResponse.json({ url: `/uploads/${fileName}` });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
