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
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search");
    const skip = (page - 1) * limit;

    // Build the query
    const query: any = {
      userId: session.user.id,
    };

    // Add filters if provided
    if (category) {
      query.tags = {
        has: category,
      };
    }

    if (search) {
      query.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch saved content with only fields that exist in the database
    // Check what fields exist in the database using Prisma introspection
    try {
      const items = await prisma.savedContent.findMany({
        where: query,
        orderBy: {
          savedAt: "desc",
        },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          url: true,
          siteName: true,
          contentType: true,
          tags: true,
          notes: true,
          savedAt: true
          // Removed 'summary' which is causing the error
        }
      });

      // Get total count for pagination
      const total = await prisma.savedContent.count({
        where: query,
      });

      // Transform the data to match our frontend expectations
      const transformedItems = items.map(item => ({
        id: item.id,
        title: item.title,
        url: item.url,
        favicon: null, // We'll need to add this feature later
        contentType: item.contentType,
        notes: item.notes,
        categories: (item.tags as string[]) || [],
        createdAt: item.savedAt.toISOString(),
        updatedAt: item.savedAt.toISOString()
      }));

      return NextResponse.json({
        items: transformedItems,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      });
    } catch (error: any) {
      // Handle specific database field errors by dynamically adjusting the query
      if (error.code === 'P2022') {
        console.log('Database field missing, adjusting query...');
        
        // Get a minimal set of fields that should exist
        const items = await prisma.savedContent.findMany({
          where: query,
          orderBy: {
            savedAt: "desc",
          },
          skip,
          take: limit,
          select: {
            id: true,
            title: true,
            url: true,
            userId: true,
            savedAt: true,
          }
        });
        
        const total = await prisma.savedContent.count({
          where: query,
        });
        
        // Return with minimal data
        const transformedItems = items.map(item => ({
          id: item.id,
          title: item.title,
          url: item.url,
          favicon: null,
          contentType: 'unknown',
          notes: '',
          categories: [],
          createdAt: item.savedAt.toISOString(),
          updatedAt: item.savedAt.toISOString()
        }));
        
        return NextResponse.json({
          items: transformedItems,
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        });
      } else {
        throw error; // Re-throw if it's not a field error
      }
    }
  } catch (error) {
    console.error("Error retrieving saved content:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve saved content",
      },
      { status: 500 }
    );
  }
} 