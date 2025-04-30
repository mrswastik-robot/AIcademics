import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";

// Define types for content chunks
interface ContentChunk {
  id: string;
  content: string;
  embedding: string;
  contentEmbeddingId: string;
  contentEmbedding: {
    id: string;
    embedding: string;
    dimensions: number;
    savedContentId: string;
    savedContent: {
      id: string;
      title: string;
      url: string;
      siteName: string | null;
      contentType: string;
      tags: any;
      notes: string | null;
      summary: string | null;
      savedAt: Date;
    }
  }
}

interface ScoredChunk {
  chunk: ContentChunk;
  score: number;
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Parse query parameters
    const url = new URL(req.url);
    const query = url.searchParams.get("query");
    const limit = parseInt(url.searchParams.get("limit") || "5");
    const useRAG = url.searchParams.get("rag") === "true";
    
    if (!query) {
      return NextResponse.json({
        success: false,
        error: "Query parameter is required"
      }, { status: 400 });
    }
    
    // Generate embedding for the query
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    
    const queryEmbedding = await embeddings.embedQuery(query);
    
    // Get all content chunks with embeddings
    const contentChunks = await prisma.contentChunk.findMany({
      include: {
        contentEmbedding: {
          include: {
            savedContent: {
              select: {
                id: true,
                title: true,
                url: true,
                siteName: true,
                contentType: true,
                tags: true,
                notes: true,
                summary: true,
                savedAt: true
              }
            }
          }
        }
      }
    }) as ContentChunk[];
    
    // Calculate similarity scores
    const scoredChunks = contentChunks.map(chunk => {
      const chunkEmbedding = JSON.parse(chunk.embedding) as number[];
      const score = cosineSimilarity(queryEmbedding, chunkEmbedding);
      return { chunk, score };
    });
    
    // Sort by similarity score
    scoredChunks.sort((a: ScoredChunk, b: ScoredChunk) => b.score - a.score);
    
    // Get the top chunks
    const topChunks = scoredChunks.slice(0, limit);
    
    let answer: string | null = null;
    
    // If RAG is enabled, generate an answer using the LLM
    if (useRAG && topChunks.length > 0) {
      // Initialize the LLM
      const llm = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: "gpt-3.5-turbo"
      });
      
      // Create a prompt with the context
      const contextText = topChunks
        .map((item: ScoredChunk) => item.chunk.content)
        .join("\n\n");
      
      // Generate the answer
      const response = await llm.invoke([
        { role: "system", content: "You are a helpful assistant that provides accurate information based on the provided context. If the context doesn't contain relevant information to answer the query, say that you don't have enough information." },
        { role: "user", content: `Context information:\n${contextText}\n\nBased on the above context, answer this question: ${query}` }
      ]);
      
      answer = response.content as string;
    }
    
    // Format the results
    const results = topChunks.map((item: ScoredChunk) => {
      const { chunk, score } = item;
      return {
        contentId: chunk.contentEmbedding.savedContent.id,
        title: chunk.contentEmbedding.savedContent.title,
        url: chunk.contentEmbedding.savedContent.url,
        siteName: chunk.contentEmbedding.savedContent.siteName,
        contentType: chunk.contentEmbedding.savedContent.contentType,
        relevanceScore: score,
        snippet: chunk.content.length > 300 ? chunk.content.substring(0, 300) + "..." : chunk.content
      };
    });
    
    return NextResponse.json({
      success: true,
      results,
      answer
    });
  } catch (error) {
    console.error("Error searching content:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to search content"
    }, { status: 500 });
  }
} 