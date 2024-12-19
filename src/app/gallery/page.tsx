import GalleryCourseCard from "@/components/GalleryCourseCard";
import { prisma } from "@/lib/db";
import React from "react";

import BlurIn from "@/components/ui/blur-in";

type Props = {};

const GalleryPage = async (props: Props) => {
  const courses = await prisma.course.findMany({
    include: {
      units: {
        include: { chapters: true },
      },
    },
  });
  return (
    <div className="min-h-screen w-full bg-white dark:bg-black relative">
      <BlurIn
      word="See what others are learning!!"
      className="text-4xl font-bold text-black py-8 dark:text-white"
      />
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[length:40px_40px]" />
      <div className="absolute inset-0 bg-dots-black/[0.03] dark:bg-dots-white/[0.03] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <div className="py-8 mx-auto max-w-7xl relative">
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 place-items-center">
          {courses.map((course) => {
            return <GalleryCourseCard course={course} key={course.id} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;