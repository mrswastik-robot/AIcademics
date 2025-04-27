import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// WARNING: This is only for debugging and should be removed in production
export async function GET(req: Request) {
  try {
    // Check if this is a development environment
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        {
          success: false,
          error: "Debug endpoints are only available in development mode",
        },
        { status: 403 }
      );
    }

    // Get all saved content for debugging
    const allContent = await prisma.savedContent.findMany({
      orderBy: {
        savedAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: allContent.length,
      data: allContent,
    });
  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error fetching debug data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
} 