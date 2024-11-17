//api/course/createChapters

import { generateCourseStructure, validateCourseStructure } from "@/lib/course-generation";
import { getAuthSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { createChapterSchema } from "../../../../../validators/course";
import { prisma } from "@/lib/db";
import { getUnsplashImage } from "@/lib/unsplash";

export async function POST(req: Request, res: Response) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("unauthorised", { status: 401 });
    }

    const body = await req.json();
    
    try {
      const { title, units: mainTopics } = createChapterSchema.parse(body);
      
      // Generate course structure
      try {
        const courseStructure = await generateCourseStructure(title, mainTopics);
        const validation = validateCourseStructure(courseStructure);
        
        if (!validation.isValid) {
          return NextResponse.json({ 
            error: "Generated course structure did not meet quality standards",
            feedback: validation.feedback 
          }, { status: 400 });
        }

        // Get course image
        let imageUrl;
        try {
          imageUrl = await getUnsplashImage(title);
        } catch (imageError) {
          console.error("Error getting image:", imageError);
          imageUrl = ""; // Fallback to empty string if image fetch fails
        }

        // Create course in database
        try {
          const course = await prisma.course.create({
            data: {
              name: title,
              image: imageUrl,
              units: {
                create: courseStructure.units.map((unit) => ({
                  name: unit.title,
                  chapters: {
                    create: unit.chapters.map((chapter) => ({
                      name: chapter.chapter_title,
                      youtubeSearchQuery: chapter.youtube_search_query
                    }))
                  }
                }))
              }
            }
          });

          return NextResponse.json({
            course_id: course.id,
            units: courseStructure.units
          });

        } catch (dbError) {
          console.error("Database error:", dbError);
          return NextResponse.json({ 
            error: "Failed to save course",
            details: "Database error occurred"
          }, { status: 500 });
        }

      } catch (generationError) {
        console.error("Generation error:", generationError);
        return NextResponse.json({ 
          error: "Failed to generate course structure",
          details: generationError instanceof Error ? generationError.message : "Unknown error"
        }, { status: 500 });
      }

    } catch (validationError) {
      console.error("Validation error:", validationError);
      return NextResponse.json({ 
        error: "Invalid input",
        details: "Please check your input values"
      }, { status: 400 });
    }

  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ 
      error: "Server error",
      details: "An unexpected error occurred"
    }, { status: 500 });
  }
}