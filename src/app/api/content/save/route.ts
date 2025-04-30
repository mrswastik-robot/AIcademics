import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parse the request body
    const contentData = await req.json();

    // Extract data from the request
    const {
      metadata,
      content,
      contentType,
      userTags,
      userNotes,
      savedAt
    } = contentData;

    // Save the content to the database
    const savedContent = await prisma.savedContent.create({
      data: {
        title: metadata.title,
        url: metadata.url,
        siteName: metadata.siteName,
        contentType: contentType,
        content: content,
        tags: userTags,
        notes: userNotes,
        savedAt: new Date(savedAt), 
        user: {
          connect: {
            id: session.user.id
          }
        }
      }
    });

    // Trigger embedding generation in the background
    generateEmbeddings(savedContent.id).catch(error => {
      console.error("Error generating embeddings in background:", error);
    });

    return NextResponse.json({
      success: true,
      contentId: savedContent.id
    });
  } catch (error) {
    console.error("Error saving content:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to save content"
    }, { status: 500 });
  }
}

// Function to generate embeddings in the background
async function generateEmbeddings(contentId: string): Promise<void> {
  try {
    // Call the embedding API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/content/embed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: contentId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate embeddings: ${response.statusText}`);
    }

    console.log(`Embeddings generated for content ${contentId}`);
  } catch (error) {
    console.error(`Error generating embeddings for content ${contentId}:`, error);
    throw error;
  }
} 