//api/course/createChapters

import { generateCourseStructure, validateCourseStructure } from "@/lib/course-generation";
import { getAuthSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { createChapterSchema } from "../../../../../validators/course";

export async function POST(req: Request, res: Response) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new NextResponse("unauthorised", { status: 401 });
    }

    const body = await req.json();
    const { title, units: mainTopics } = createChapterSchema.parse(body);

    // Generate course structure using our enhanced logic
    try {
      const courseStructure = await generateCourseStructure(title, mainTopics);

      // Validate the generated structure
      const validation = validateCourseStructure(courseStructure);
      
      if (!validation.isValid) {
        console.log("Course structure validation failed:", validation.feedback);
        return NextResponse.json({ 
          error: "Generated course structure did not meet quality standards",
          feedback: validation.feedback 
        }, { status: 400 });
      }

      // Transform the structure to match your existing format
      const output_units = courseStructure.units.map(unit => ({
        title: unit.title,
        chapters: unit.chapters.map(chapter => ({
          youtube_search_query: chapter.youtube_search_query,
          chapter_title: chapter.chapter_title
        }))
      }));

      return NextResponse.json(output_units);
    } catch (error) {
      console.error("Course generation error:", error);
      return NextResponse.json({ 
        error: "Failed to generate course structure",
        details: error instanceof Error ? error.message : "Unknown error"
      }, { status: 500 });
    }
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json({ 
      error: "Error processing request",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}