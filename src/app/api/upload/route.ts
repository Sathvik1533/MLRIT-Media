import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const sizeCategory = formData.get("sizeCategory") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Upload to Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;
    
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("upload_preset", "ml_default"); // You may need to create this in Cloudinary
    uploadFormData.append("folder", "test-lab");

    const uploadResponse = await fetch(cloudinaryUrl, {
      method: "POST",
      body: uploadFormData,
    });

    const uploadData = await uploadResponse.json();

    // Store in database
    const media = await prisma.media.create({
      data: {
        title: `Test ${sizeCategory} ${file.type.startsWith("video") ? "video" : "image"}`,
        description: `Performance test asset - ${sizeCategory}`,
        type: file.type.startsWith("video") ? "video" : "image",
        category: "technical",
        cloudinaryPublicId: uploadData.public_id,
        thumbnailUrl: uploadData.secure_url,
        duration: uploadData.duration || null,
      },
    });

    return NextResponse.json({
      id: media.id,
      publicId: uploadData.public_id,
      url: uploadData.secure_url,
      type: media.type,
      size: sizeCategory,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
