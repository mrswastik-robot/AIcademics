"use client";

import { Course , Unit , Chapter } from '@prisma/client'
import React from 'react'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button , buttonVariants } from './ui/button'
import Link from 'next/link'
import { Separator } from './ui/separator'

import ChapterCard from './ChapterCard'

type Props = {
    course: Course & {
        units: (Unit & {
            chapters: Chapter[]
        })[]
    }
}

const ConfirmChapters = ({course}: Props) => {
  return (
    <div className='w-full mt-4'>

        {course.units.map((unit, unitIndex) => {
        return (
          <div key={unit.id} className="mt-5">
            <h2 className="text-sm uppercase text-secondary-foreground/60">
              Unit {unitIndex + 1}
            </h2>
            <h3 className="text-2xl font-bold">{unit.name}</h3>
            <div className="mt-3">
              {unit.chapters.map((chapter, chapterIndex) => {
                return (
                  <ChapterCard
                    // completedChapters={completedChapters}
                    // setCompletedChapters={setCompletedChapters}
                    // ref={chapterRefs[chapter.id]}
                    key={chapter.id}
                    chapter={chapter}
                    chapterIndex={chapterIndex}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-center mt-4">
        <Separator className="flex-[1]" />
        <div className="flex items-center mx-4">
          <Link
            href="/create"
            className={buttonVariants({
              variant: "secondary",
            })}
          >
            <ChevronLeft className="w-4 h-4 mr-2" strokeWidth={4} />
            Back
          </Link>
          {/* {totalChaptersCount === completedChapters.size ? (
            <Link
              className={buttonVariants({
                className: "ml-4 font-semibold",
              })}
              href={`/course/${course.id}/0/0`}
            >
              Save & Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          ) : (
            <Button
              type="button"
              className="ml-4 font-semibold"
              disabled={loading}
              onClick={() => {
                setLoading(true);
                Object.values(chapterRefs).forEach((ref) => {
                  ref.current?.triggerLoad();
                });
              }}
            >
              Generate
              <ChevronRight className="w-4 h-4 ml-2" strokeWidth={4} />
            </Button>
          )} */}
          <Button
              type="button"
              className="ml-4 font-semibold"
              // disabled={loading}
              // onClick={() => {
              //   setLoading(true);
              //   Object.values(chapterRefs).forEach((ref) => {
              //     ref.current?.triggerLoad();
              //   });
              // }}
            >
              Generate
              <ChevronRight className="w-4 h-4 ml-2" strokeWidth={4} />
            </Button>
        </div>
        <Separator className="flex-[1]" />
      </div>

    </div>
  )
}

export default ConfirmChapters