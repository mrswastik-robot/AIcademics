import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";
import { InfoIcon } from "lucide-react";
import CreateCourseForm from "@/components/CreateCourseForm";

type Props = {};

const CreatePage = async (props: Props) => {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/gallery");
  }

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
        <div className="flex flex-col items-start max-w-xl px-8 pt-4 mx-auto my-16 sm:px-0 relative">
          <h1 className="self-center text-3xl font-bold text-center sm:text-6xl">
            Welcome to AIcademics!
          </h1>
          <div className="flex p-4 mt-5 border-none bg-gray-100/80 dark:bg-secondary/80 backdrop-blur-sm rounded-lg">
            <InfoIcon className="w-12 h-12 mr-3 text-blue-400" />
            <div>
              Enter in a course title, or what you want to learn about. Then enter
              a list of units, which are the specifics you want to learn. And our
              AI will generate a course for you!
            </div>
          </div>

          <CreateCourseForm />
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
