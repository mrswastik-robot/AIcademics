
//api/course/createChapters

import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createChapterSchema } from "../../../../../validators/course";

import { ZodError } from "zod";

import axios from "axios";

import { strict_output } from "@/lib/gpt";

export  async function POST(req: Request, res: Response) {

    try {

        const session = await getAuthSession();
        if(!session?.user)
        {
            return new NextResponse("unauthorised",{status: 401});
        }

        const body = await req.json();
        const { title , units} = createChapterSchema.parse(body);

        type outputUnits = {                      //each unit will have a title and chapters and each chapter will have a youtube_search_query and chapter_title
            title: string,
            chapters: {
                youtube_search_query: string,
                chapter_title: string,
            }[];
        }[];

        let output_units: outputUnits = await strict_output(
            "You are an AI capable of curating course content, coming up with relevant chapter titles, and finding relevant youtube videos for each chapter",
            new Array(units.length).fill(
                `It is your job to create a course about ${title}. The user has requested to create chapters for each of the units. Then, for each chapter, provide a detailed youtube search query that can be used to find an informative educationalvideo for each chapter. Each query should give an educational informative course in youtube.`
            ),
            {    // the JSON returned by the GPT-3 API will be an array of units, each unit will have a title and chapters and each chapter will have a youtube_search_query and chapter_title
                title: "title of the unit",
                chapters:
                "an array of chapters, each chapter should have a youtube_search_query and a chapter_title key in the JSON object",
            },
        );
        
        console.log(output_units);
        return NextResponse.json(output_units);

    } catch (error) {

        if(error instanceof ZodError)
        {
            return new NextResponse("invalid body",{status: 400})
        }
        
    }

}