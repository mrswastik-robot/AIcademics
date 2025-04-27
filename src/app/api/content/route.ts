import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parse query parameters
    const url = new URL(req.url);
    const contentType = url.searchParams.get("contentType");
    const tag = url.searchParams.get("tag");
    const search = url.searchParams.get("search");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build the query
    const query: any = {
      userId: session.user.id,
    };

    if (contentType) {
      query.contentType = contentType;
    }

    if (tag) {
      query.tags = {
        has: tag,
      };
    }

    if (search) {
      query.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch saved content
    const savedContent = await prisma.savedContent.findMany({
      where: query,
      orderBy: {
        savedAt: "desc",
      },
      skip,
      take: limit,
    });

    // Get total count for pagination
    const total = await prisma.savedContent.count({
      where: query,
    });

    return NextResponse.json({
      success: true,
      data: savedContent,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error retrieving content:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve content",
      },
      { status: 500 }
    );
  }
} 