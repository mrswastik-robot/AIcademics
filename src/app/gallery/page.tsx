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
    <div className="min-h-screen overflow-hidden relative dark:bg-[#1A1F2C] bg-white dark:text-white text-black">
      <div className="relative">
        {/* Enhanced Grid Background with fade effect */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 grid-background dark:opacity-100 opacity-[0.7]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-[#1A1F2C]"></div>
        </div>

        {/* Add a subtle overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent dark:from-[#1A1F2C]/50"></div>

        {/* Content */}
        <div className="relative">
          <BlurIn
            word="See what others are learning!!"
            className="text-4xl font-bold gradient-text py-8"
          />
          <div className="py-8 mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 place-items-center">
              {courses.map((course) => {
                return <GalleryCourseCard course={course} key={course.id} />;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;