import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { z } from "zod";

// Define type-safe schemas for our course structure
const ChapterSchema = z.object({
  chapter_title: z.string(),
  youtube_search_query: z.string(),
  learning_objectives: z.array(z.string()),
  key_concepts: z.array(z.string()),
});

const UnitSchema = z.object({
  title: z.string(),
  description: z.string(),
  chapters: z.array(ChapterSchema),
});

const CourseStructureSchema = z.object({
  units: z.array(UnitSchema),
});

type CourseStructure = z.infer<typeof CourseStructureSchema>;

// System prompts for each generation step
const COURSE_OUTLINE_PROMPT = `You are an expert course creator with deep knowledge in creating educational content.
Your task is to create a well-structured course outline that follows these principles:

1. Progressive complexity - concepts build upon each other
2. Practical relevance - focus on applicable knowledge
3. Clear prerequisites - each unit clearly follows from previous units
4. Comprehensive coverage - all important subtopics are included
5. Logical flow - topics are ordered in a way that maximizes learning

Format the course outline to be detailed yet concise.`;

const UNIT_EXPANSION_PROMPT = `You are expanding a course unit into detailed chapters.
For each chapter, consider:

1. Specific learning objectives
2. Key concepts to be covered
3. How it builds on previous chapters
4. Practical applications of the content
5. Clear, focused scope for each chapter

Make the youtube_search_query specific and detailed to find high-quality educational content.
Include exact technical terms and prefer queries that would find comprehensive tutorials.`;

export async function generateCourseStructure(
  courseTitle: string,
  mainTopics: string[]
) {
  const llm = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.3, // Lower temperature for more focused outputs
    apiKey: process.env.OPENAI_API_KEY,
  });

  // Step 1: Generate high-level course outline
  const outlinePrompt = PromptTemplate.fromTemplate(`
    ${COURSE_OUTLINE_PROMPT}
    
    Course Title: {title}
    Main Topics to Cover: {topics}
    
    Generate a high-level outline for this course.
    Focus on creating a logical progression through the topics.
    
    Output the outline in a clear, structured format.`);

  // Step 2: Generate detailed units with chapters
  const unitsPrompt = PromptTemplate.fromTemplate(`
    ${UNIT_EXPANSION_PROMPT}
    
    Course Title: {title}
    Course Outline: {outline}
    
    For each unit in the outline, generate:
    1. A clear title
    2. A brief description
    3. 3-5 focused chapters that cover the unit's content
    4. For each chapter, include specific learning objectives and a detailed youtube search query
    
    Ensure each youtube search query is specific enough to find high-quality educational videos.`);

  const outputParser = new JsonOutputParser();

  const courseGenerationChain = RunnableSequence.from([
    {
      outline: async (input: { title: string; topics: string[] }) => {
        const outlineResult = await llm.invoke(
          await outlinePrompt.format({
            title: input.title,
            topics: input.topics.join(", "),
          })
        );
        return outlineResult.content.toString();
      },
      title: (input: { title: string; topics: string[] }) => input.title,
    },
    {
      structuredCourse: async (input: { outline: string; title: string }) => {
        const unitsResult = await llm.invoke(
          await unitsPrompt.format({
            title: input.title,
            outline: input.outline,
          })
        );
        
        // Parse and validate the output
        const parsedOutput = await outputParser.parse(unitsResult.content.toString());
        return CourseStructureSchema.parse(parsedOutput);
      },
    },
  ]);

  try {
    const result = await courseGenerationChain.invoke({
      title: courseTitle,
      topics: mainTopics,
    });

    return result.structuredCourse;
  } catch (error) {
    console.error("Error generating course structure:", error);
    throw new Error("Failed to generate course structure");
  }
}

// Helper function to validate and score the generated structure
export function validateCourseStructure(
  courseStructure: CourseStructure
): { isValid: boolean; score: number; feedback: string[] } {
  const feedback: string[] = [];
  let score = 0;

  // Validate number of units
  if (courseStructure.units.length < 3 || courseStructure.units.length > 8) {
    feedback.push(
      `Number of units (${courseStructure.units.length}) is not optimal. Aim for 3-8 units.`
    );
  } else {
    score += 20;
  }

  // Validate each unit
  courseStructure.units.forEach((unit, index) => {
    // Check number of chapters
    if (unit.chapters.length < 3 || unit.chapters.length > 5) {
      feedback.push(
        `Unit ${index + 1}: Number of chapters (${
          unit.chapters.length
        }) is not optimal. Aim for 3-5 chapters.`
      );
    } else {
      score += 10;
    }

    // Check chapter titles and search queries
    unit.chapters.forEach((chapter) => {
      if (chapter.youtube_search_query.length < 10) {
        feedback.push(
          `Chapter "${chapter.chapter_title}": Search query too short/generic.`
        );
      } else {
        score += 5;
      }
    });
  });

  return {
    isValid: score >= 70,
    score: Math.min(100, score),
    feedback,
  };
} 