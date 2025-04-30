import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// Process the content to create text chunks
async function processContent(content: any): Promise<string> {
  // Different processing based on content type
  if (typeof content === 'string') {
    return content;
  } else if (content.text) {
    return content.text;
  } else if (content.html) {
    // Extract text from HTML (simple implementation)
    return content.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  } else if (content.transcript) {
    // For YouTube videos, use transcript
    if (Array.isArray(content.transcript)) {
      return content.transcript.map((segment: any) => segment.text).join(' ');
    }
    return content.transcript;
  } else if (content.description) {
    // Fallback to description
    return content.description;
  }
  
  // Return a JSON stringify as last resort
  return JSON.stringify(content);
}

// Generate embeddings for content
export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Get content ID from request
    const { id } = await req.json();
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: "Content ID is required"
      }, { status: 400 });
    }
    
    // Get the content
    const savedContent = await prisma.savedContent.findUnique({
      where: {
        id,
        userId: session.user.id
      }
    });
    
    if (!savedContent) {
      return NextResponse.json({
        success: false,
        error: "Content not found"
      }, { status: 404 });
    }
    
    // Process the content to get text
    const text = await processContent(savedContent.content);
    
    // Initialize OpenAI embeddings
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    
    // Generate embedding for the whole content
    const contentEmbedding = await embeddings.embedQuery(text);
    
    // Create text splitter for chunking
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    
    // Split the text into chunks
    const textChunks = await textSplitter.splitText(text);
    
    // Generate embeddings for each chunk
    const chunkEmbeddings = await Promise.all(
      textChunks.map(chunk => embeddings.embedQuery(chunk))
    );
    
    // Store the embeddings in the database
    
    // First, check if an embedding already exists
    const existingEmbedding = await prisma.contentEmbedding.findUnique({
      where: {
        savedContentId: id
      }
    });
    
    if (existingEmbedding) {
      // Delete existing embedding and its chunks
      await prisma.contentChunk.deleteMany({
        where: {
          contentEmbeddingId: existingEmbedding.id
        }
      });
      
      await prisma.contentEmbedding.delete({
        where: {
          id: existingEmbedding.id
        }
      });
    }
    
    // Create new embedding
    const newEmbedding = await prisma.contentEmbedding.create({
      data: {
        embedding: JSON.stringify(contentEmbedding),
        dimensions: contentEmbedding.length,
        savedContentId: id,
        chunks: {
          create: textChunks.map((chunk, index) => ({
            content: chunk,
            embedding: JSON.stringify(chunkEmbeddings[index])
          }))
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      embeddingId: newEmbedding.id,
      chunks: textChunks.length
    });
  } catch (error) {
    console.error("Error generating embeddings:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to generate embeddings"
    }, { status: 500 });
  }
} 