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
    
    // Get content ID from query params
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: "Content ID is required"
      }, { status: 400 });
    }
    
    // Check if the content exists and belongs to the user
    const content = await prisma.savedContent.findUnique({
      where: {
        id,
        userId: session.user.id
      }
    });
    
    if (!content) {
      return NextResponse.json({
        success: false,
        error: "Content not found or you don't have permission to delete it"
      }, { status: 404 });
    }
    
    // Delete related embeddings first (cascading delete will handle chunks)
    const embedding = await prisma.contentEmbedding.findUnique({
      where: {
        savedContentId: id
      }
    });
    
    if (embedding) {
      await prisma.contentEmbedding.delete({
        where: {
          id: embedding.id
        }
      });
    }
    
    // Delete the content
    await prisma.savedContent.delete({
      where: {
        id
      }
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