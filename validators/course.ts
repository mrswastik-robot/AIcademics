import { z } from 'zod';

// Schema for individual chapters
const ChapterSchema = z.object({
  chapter_title: z.string().min(3).max(255),
  youtube_search_query: z.string().min(10),
  learning_objectives: z.array(z.string()),
  key_concepts: z.array(z.string()),
});

// Schema for units
const UnitSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10),
  chapters: z.array(ChapterSchema),
});

// Input schema for course creation
export const createChapterSchema = z.object({
  title: z.string().min(3).max(255)
    .describe('The main title of the course'),
  units: z.array(z.string().min(3).max(255))
    .min(1, 'At least one unit is required')
    .max(8, 'Maximum 8 units allowed')
    .describe('Array of main topics to be covered in the course'),
});

// Schema for the complete course structure (used for validation)
export const courseStructureSchema = z.object({
  units: z.array(UnitSchema)
    .min(1, 'Course must have at least 1 unit')
    .max(8, 'Course cannot have more than 8 units'),
});

// Export types for use in other files
export type CreateChapterInput = z.infer<typeof createChapterSchema>;
export type CourseStructure = z.infer<typeof courseStructureSchema>;
export type Unit = z.infer<typeof UnitSchema>;
export type Chapter = z.infer<typeof ChapterSchema>;