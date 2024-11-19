"use client"

import React from 'react'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { createChapterSchema } from '../../validators/course'

import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from './ui/separator'

import { Plus , Trash } from 'lucide-react'

import { AnimatePresence, motion } from "framer-motion";

import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'

import { useToast } from './ui/use-toast'

type Input = z.infer<typeof createChapterSchema>

// Add CSS for the loader
const loaderStyles = `
  .loader {
    width: 120px;
    height: 22px;
    border-radius: 20px;
    color: #514b82;
    border: 2px solid;
    position: relative;
    margin: 0 auto;
  }
  .loader::before {
    content: "";
    position: absolute;
    margin: 2px;
    inset: 0 100% 0 0;
    border-radius: inherit;
    background: currentColor;
    animation: l6 2s infinite;
  }
  @keyframes l6 {
    100% {inset:0}
  }
`;

const CreateCourseForm = () => {
  const router = useRouter();
  const {toast} = useToast();

  const { mutate: createChapters, isPending } = useMutation({
    mutationFn: async ({ title, units }: Input) => {
      const response = await axios.post("/api/course/createChapters", {
        title,
        units,
      });
      return response.data;
    },
  });

  const form = useForm<Input>({
    resolver: zodResolver(createChapterSchema),
    defaultValues: {
      title: '',
      units: ['','','']
    }
  });

  function onSubmit(data: Input) {
    if (data.units.some((unit) => unit === "")) {
      toast({
        title: "Error",
        description: "Please fill all the units",
        variant: "destructive",
      });
      return;
    }

    createChapters(data, {
      onSuccess: ({course_id}) => {
        toast({
          title: "Success",
          description: "Course created successfully",
        })
        router.push(`/create/${course_id}`)
      },
      onError: (error) => {
        console.log(error);
        toast({
          title: "Error",
          description: "Something went wrong",
          variant: "destructive",
        });
      },
    });
  }

  form.watch();

  return (
    <>
      {/* Add the loader styles */}
      <style>{loaderStyles}</style>

      <div className='w-full'>
        <Form {...form}>
          <form className='w-full mt-4' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-col items-start w-full sm:items-center sm:flex-row">
                    <FormLabel className="flex-[1] text-xl">Title</FormLabel>
                    <FormControl className="flex-[6]">
                      <Input
                        placeholder="Enter the main topic of the course"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                );
              }}
            />

            <AnimatePresence>
              {form.watch("units").map((_, index) => {
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{
                      opacity: { duration: 0.2 },
                      height: { duration: 0.2 },
                    }}
                  >
                    <FormField
                      key={index}
                      control={form.control}
                      name={`units.${index}`}
                      render={({ field }) => {
                        return (
                          <FormItem className="flex flex-col items-start w-full sm:items-center sm:flex-row">
                            <FormLabel className="flex-[1] text-xl">
                              Unit {index + 1}
                            </FormLabel>
                            <FormControl className="flex-[6]">
                              <Input
                                placeholder="Enter subtopic of the course"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        );
                      }}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <div className="flex items-center justify-center mt-4">
              <Separator className="flex-[1]" />
              <div className="mx-4">
                <Button
                  type="button"
                  variant="secondary"
                  className="font-semibold"
                  onClick={() => {
                    form.setValue("units", [...form.watch("units"), ""]);
                  }}
                >
                  Add Unit
                  <Plus className="w-4 h-4 ml-2 text-green-500" />
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  className="font-semibold ml-2"
                  onClick={() => {
                    form.setValue("units", form.watch("units").slice(0, -1));
                  }}
                >
                  Remove Unit
                  <Trash className="w-4 h-4 ml-2 text-red-500" />
                </Button>
              </div>
              <Separator className="flex-[1]" />
            </div>

            <div className="mt-6">
              {isPending ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="loader"></div>
                  <p className="text-sm text-muted-foreground">
                    Generating your course...
                  </p>
                </div>
              ) : (
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                >
                  Let&apos;s Go!
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default CreateCourseForm