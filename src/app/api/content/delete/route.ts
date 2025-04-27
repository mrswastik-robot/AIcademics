import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    // Check authentication
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the content ID from the URL
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

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

    // Delete the content
    await prisma.savedContent.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "Content deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting content:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to delete content"
    }, { status: 500 });
  }
} 