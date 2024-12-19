"use client";

import Image from "next/image";
import { motion, useAnimation, useInView } from "framer-motion";
// Remove unnecessary Lucide imports
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Marquee } from "../eldoraui/marquee";

const tiles = [
  {
    icon: <Image 
      src="/nextjs.svg" 
      alt="Next.js" 
      width={32} 
      height={32} 
      className="size-full"
    />,
    bg: (
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r from-gray-600 via-gray-500 to-gray-400 opacity-40 blur-[15px]"></div>
    ),
  },
  {
    icon: <Image 
      src="/Zod.svg" 
      alt="Zod" 
      width={32} 
      height={32} 
      className="size-full"
    />,
    bg: (
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 opacity-40 blur-[15px]"></div>
    ),
  },
  {
    icon: <Image 
      src="/tailwind.svg" 
      alt="Tailwind" 
      width={32} 
      height={32} 
      className="size-full"
    />,
    bg: (
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r from-green-500 via-teal-500 to-emerald-600 opacity-40 blur-[15px]"></div>
    ),
  },
  {
    icon: <Image 
      src="/Prisma.svg" 
      alt="Prisma" 
      width={32} 
      height={32} 
      className="size-full"
    />,
    bg: (
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 opacity-40 blur-[15px]"></div>
    ),
  },
  {
    icon: <Image 
      src="/Openai.svg" 
      alt="OpenAI" 
      width={32} 
      height={32} 
      className="size-full"
    />,
    bg: (
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r from-orange-600 via-rose-600 to-violet-600 opacity-40 blur-[15px]"></div>
    ),
  },
  {
    icon: <Image 
      src="/Langchain.svg" 
      alt="Langchain" 
      width={32} 
      height={32} 
      className="size-full"
    />,
    bg: (
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible rounded-full bg-gradient-to-r from-gray-600 via-gray-500 to-gray-400 opacity-40 blur-[15px]"></div>
    ),
  },
];

function shuffleArray(array: any[]) {
  let currentIndex = array.length;
  let randomIndex;
  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

function Card(card: { icon: JSX.Element; bg: JSX.Element }) {
  const id = useId();
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        transition: { delay: Math.random() * 2, ease: "easeOut", duration: 1 },
      });
    }
  }, [controls, inView]);

  return (
    <motion.div
      key={id}
      ref={ref}
      initial={{ opacity: 0 }}
      animate={controls}
      className={cn(
        "relative size-24 cursor-pointer overflow-hidden rounded-2xl border p-5",
        "bg-white/90 [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        "transform-gpu dark:bg-black/20 dark:[border:1px_solid_rgba(255,255,255,.15)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff3f_inset]",
      )}
    >
      {card.icon}
      {card.bg}
    </motion.div>
  );
}

export function Integrations() {
  const [randomTiles1, setRandomTiles1] = useState<typeof tiles>([]);
  const [randomTiles2, setRandomTiles2] = useState<typeof tiles>([]);
  const [randomTiles3, setRandomTiles3] = useState<typeof tiles>([]);
  const [randomTiles4, setRandomTiles4] = useState<typeof tiles>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Ensures this runs client-side
      setRandomTiles1(shuffleArray([...tiles]));
      setRandomTiles2(shuffleArray([...tiles]));
      setRandomTiles3(shuffleArray([...tiles]));
      setRandomTiles4(shuffleArray([...tiles]));
    }
  }, []);

  return (
    <section id="cta">
      <div className="container mx-auto px-4 py-15 md:px-8">
        <div className="flex w-full flex-col items-center justify-center">
          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
            <Marquee
              reverse
              className="-delay-[200ms] [--duration:10s]"
              repeat={5}
            >
              {randomTiles1.map((review, idx) => (
                <Card key={idx} {...review} />
              ))}
            </Marquee>
            <Marquee reverse className="[--duration:25s]" repeat={5}>
              {randomTiles2.map((review, idx) => (
                <Card key={idx} {...review} />
              ))}
            </Marquee>
            <Marquee
              reverse
              className="-delay-[200ms] [--duration:20s]"
              repeat={5}
            >
              {randomTiles1.map((review, idx) => (
                <Card key={idx} {...review} />
              ))}
            </Marquee>
            <Marquee reverse className="[--duration:30s]" repeat={5}>
              {randomTiles2.map((review, idx) => (
                <Card key={idx} {...review} />
              ))}
            </Marquee>
            <Marquee
              reverse
              className="-delay-[200ms] [--duration:20s]"
              repeat={5}
            >
              {randomTiles3.map((review, idx) => (
                <Card key={idx} {...review} />
              ))}
            </Marquee>
            <Marquee reverse className="[--duration:30s]" repeat={5}>
              {randomTiles4.map((review, idx) => (
                <Card key={idx} {...review} />
              ))}
            </Marquee>
            <div className="absolute ">
              <div className="bg-backtround dark:bg-background absolute inset-0  -z-10 rounded-full opacity-40 blur-xl" />
              <h2 className=" text-[4rem] text-center font-bold text-black dark:text-white">Made with latest and greatest technologies!</h2>
            </div>
            <div className="to-backtround dark:to-background absolute inset-x-0 bottom-0 h-full bg-gradient-to-b from-transparent to-70%" />
          </div>
        </div>
      </div>
    </section>
  );
}
