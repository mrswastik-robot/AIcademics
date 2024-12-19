import { Chapter, Course, Unit } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {
  course: Course & {
    units: (Unit & {
      chapters: Chapter[];
    })[];
  };
};

const GalleryCourseCard = async ({ course }: Props) => {
  return (
    <>
      <div className="border-2 rounded-lg border-secondary w-[280px] h-[280px] flex flex-col">
        <div className="relative h-[120px] w-full">
          <Link
            href={`/course/${course.id}/0/0`}
            className="relative block h-full"
          >
            <Image
              src={course.image || ""}
              className="object-cover rounded-t-lg"
              fill
              sizes="(max-width: 250px) 100vw"
              priority
              alt="picture of the course"
            />
            <span className="absolute px-2 py-1 text-white rounded-md bg-black/60 w-fit bottom-2 left-2">
              {course.name}
            </span>
          </Link>
        </div>

        <div className="p-3 flex-1 overflow-hidden">
          <h4 className="text-sm text-secondary-foreground/60 mb-2">Units</h4>
          <div className="space-y-1 overflow-y-auto max-h-[120px] pr-2 text-sm">
            {course.units.map((unit, unitIndex) => {
              return (
                <Link
                  href={`/course/${course.id}/${unitIndex}/0`}
                  key={unit.id}
                  className="block underline w-fit"
                >
                  {unit.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default GalleryCourseCard;