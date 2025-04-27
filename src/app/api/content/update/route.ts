import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    // Check authentication
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parse the request body
    const { id, tags, notes, summary, keyEntities } = await req.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        error: "Content ID is required",
      }, { status: 400 });
    }

    // Get the existing content to verify ownership
    const existingContent = await prisma.savedContent.findUnique({
      where: { 
        id,
        userId: session.user.id
      }
    });

    if (!existingContent) {
      return NextResponse.json({
        success: false,
        error: "Content not found or not owned by user",
      }, { status: 404 });
    }

    // Prepare update data (only include fields that are provided)
    const updateData: any = {};
    if (tags !== undefined) updateData.tags = tags;
    if (notes !== undefined) updateData.notes = notes;
    if (summary !== undefined) updateData.summary = summary;
    if (keyEntities !== undefined) updateData.keyEntities = keyEntities;

    // Update the content
    const updatedContent = await prisma.savedContent.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: updatedContent
    });
  } catch (error) {
    console.error("Error updating content:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to update content"
    }, { status: 500 });
  }
} 