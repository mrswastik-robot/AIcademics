import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
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

// Make the system prompt more explicit about unit requirements
const SYSTEM_PROMPT = `You are an expert course creator with deep knowledge in creating educational content.
Your task is to create a course structure that EXACTLY matches the provided topics.

STRICT REQUIREMENTS:
1. Create EXACTLY ONE UNIT for EACH provided topic - no more, no less
2. Each unit title should closely match its corresponding topic
3. Each unit must have 3-5 detailed chapters
4. Each chapter must include:
   - A specific, descriptive title
   - A detailed YouTube search query
   - 3-5 learning objectives
   - 3-5 key concepts

Follow these principles:
- Progressive complexity - concepts build upon each other
- Practical relevance - focus on applicable knowledge
- Clear prerequisites - each unit clearly follows from previous units
- Comprehensive coverage - cover all aspects of each topic
- Logical flow - order topics to maximize learning`;

export async function generateCourseStructure(
  courseTitle: string,
  mainTopics: string[]
) {
  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-1106",
    temperature: 0.1,
  });

  // Create a more explicit function schema
  const functionSchema = {
    name: "create_course_unit",
    description: "Create a single course unit with chapters",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The title of the unit"
        },
        description: {
          type: "string",
          description: "A brief description of the unit's content"
        },
        chapters: {
          type: "array",
          description: "3-5 chapters for this unit",
          items: {
            type: "object",
            properties: {
              chapter_title: {
                type: "string",
                description: "Title of the chapter"
              },
              youtube_search_query: {
                type: "string",
                description: "Detailed search query for finding relevant educational videos"
              },
              learning_objectives: {
                type: "array",
                description: "3-5 specific learning objectives",
                items: { type: "string" }
              },
              key_concepts: {
                type: "array",
                description: "3-5 key concepts covered",
                items: { type: "string" }
              }
            },
            required: ["chapter_title", "youtube_search_query", "learning_objectives", "key_concepts"]
          },
          minItems: 3,
          maxItems: 5
        }
      },
      required: ["title", "description", "chapters"]
    }
  };

  try {
    // Generate units one by one
    const generatedUnits = await Promise.all(mainTopics.map(async (topic) => {
      const runnable = model
        .bind({
          functions: [functionSchema],
          function_call: { name: "create_course_unit" }
        })
        .pipe(new JsonOutputFunctionsParser());

      const messages = [
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(
          `Create a detailed unit structure for the topic "${topic}" as part of the course "${courseTitle}".
          
          Requirements:
          1. The unit title should closely match the topic "${topic}"
          2. Include 3-5 detailed chapters
          3. Each chapter must have:
             - A clear, specific title
             - A detailed YouTube search query
             - 3-5 learning objectives
             - 3-5 key concepts
          
          Make sure all content is focused specifically on ${topic}.`
        )
      ];

      const result = await runnable.invoke(messages);
      console.log(`Generated unit for topic "${topic}":`, JSON.stringify(result, null, 2));
      return result;
    }));

    // Combine all units into the course structure
    const courseStructure = {
      units: generatedUnits
    };

    // Validate the complete structure
    try {
      const parsedResult = CourseStructureSchema.parse(courseStructure);
      
      // Validate that each topic is represented
      const unitTitles = parsedResult.units.map(unit => unit.title.toLowerCase());
      const missingTopics = mainTopics.filter(topic => 
        !unitTitles.some(title => title.includes(topic.toLowerCase()))
      );

      if (missingTopics.length > 0) {
        throw new Error(`Missing units for topics: ${missingTopics.join(', ')}`);
      }

      return parsedResult;
    } catch (validationError) {
      console.error("Validation error:", validationError);
      throw new Error(`Generated structure failed validation: ${validationError instanceof Error ? validationError.message : "Unknown error"}`);
    }

  } catch (error) {
    console.error("Detailed generation error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw new Error(`Failed to generate course structure: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// Updated validation function to handle single unit courses
export function validateCourseStructure(
  courseStructure: CourseStructure
): { isValid: boolean; score: number; feedback: string[] } {
  const feedback: string[] = [];
  let score = 0;
  const totalUnits = courseStructure.units.length;

  // Validate number of units - now accepts 1-8 units
  if (totalUnits < 1 || totalUnits > 8) {
    feedback.push(
      `Number of units (${totalUnits}) is not valid. Must be between 1 and 8 units.`
    );
  } else {
    // Adjust scoring based on number of units
    if (totalUnits >= 3) {
      score += 20; // Full score for 3+ units
    } else {
      score += 10; // Partial score for 1-2 units
    }
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
      // Adjust chapter scoring based on total units
      score += totalUnits === 1 ? 30 : 10; // Higher score per unit when there's only one unit
    }

    // Check chapter titles and search queries
    unit.chapters.forEach((chapter) => {
      if (chapter.youtube_search_query.length < 10) {
        feedback.push(
          `Chapter "${chapter.chapter_title}": Search query too short/generic.`
        );
      } else {
        // Adjust scoring for search queries based on total units
        score += totalUnits === 1 ? 10 : 5; // Higher score per chapter when there's only one unit
      }
    });
  });

  // Adjust passing score based on number of units
  const requiredScore = totalUnits === 1 ? 50 : 70;

  return {
    isValid: score >= requiredScore,
    score: Math.min(100, score),
    feedback,
  };
} 