"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronRight, BookOpen, Youtube, Brain, Sparkles } from "lucide-react";
import Image from "next/image";
import { GitStarButton } from "@/components/eldoraui/gitstarbutton";
import { Integrations } from "@/components/eldoraui/integrations";
import Safari from "@/components/ui/safari";

// import { getAuthSession } from "@/lib/auth";
import Link from "next/link";

const Index = () => {
  // const session = getAuthSession();

  const [isHovered, setIsHovered] = useState(false);

  const features = [
    {
      icon: <BookOpen className="w-6 h-6 text-primary" />,
      title: "Personalized Learning Path",
      description:
        "Create custom courses tailored to your specific learning needs and goals.",
    },
    {
      icon: <Youtube className="w-6 h-6 text-primary" />,
      title: "Curated Video Content",
      description:
        "Access carefully selected YouTube videos that perfectly match your topics.",
    },
    {
      icon: <Brain className="w-6 h-6 text-primary" />,
      title: "AI-Powered Structure",
      description:
        "Let AI organize your learning materials in the most effective sequence.",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-primary" />,
      title: "Enhanced Learning",
      description:
        "Benefit from LangChain's advanced processing for optimal course structure.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white overflow-hidden relative">
      {/* Add gradient overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-x-0 bottom-0 h-[75vh] bg-gradient-to-t from-[#A17BE0]/25 via-[#A17BE0]/10 to-transparent" />
      </div>

      {/* Hero Section */}
      <div className="relative">
        {/* Enhanced Grid Background with fade effect */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 grid-background opacity-100"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#1A1F2C]"></div>
        </div>

        {/* Add a subtle overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1F2C]/50 to-transparent"></div>

        {/* Content */}
        <div className="container mx-auto px-4 pt-20 pb-32 relative">
          <div className="flex flex-col items-center max-w-4xl mx-auto">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <span className="px-4 py-2 rounded-full bg-[#292A40] text-[#B085F4] inline-block mb-6 text-sm font-medium">
                Revolutionize Your Learning Journey
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Generate Personalized Courses with
                <span className="gradient-text block mt-2">
                  AI-Powered Intelligence
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-400 mb-8">
                Transform any topic into a structured learning experience.
                Simply input your interests, and let AI craft the perfect course
                for you.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex justify-center"
              >
                <Link href="/create">
                  <Button
                    size="lg"
                    className="bg-[#A17BE0] hover:bg-[#A17BE0]/90 text-white px-8 py-6 rounded-full text-lg font-medium"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    Start Learning Now
                    <ChevronRight
                      className={`ml-2 w-5 h-5 transition-transform duration-300 ${
                        isHovered ? "translate-x-1" : ""
                      }`}
                    />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Product Showcase */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full"
            >
              {/* Add gradient overlays */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-x-0 top-0 h-[20vh] bg-gradient-to-b from-[#A17BE0]/25 to-transparent"></div>
                <div className="absolute inset-x-0 bottom-0 h-[20vh] bg-gradient-to-t from-[#A17BE0]/25 to-transparent"></div>
                <div className="absolute inset-y-0 left-0 w-[20vw] bg-gradient-to-r from-[#A17BE0]/25 to-transparent"></div>
                <div className="absolute inset-y-0 right-0 w-[20vw] bg-gradient-to-l from-[#A17BE0]/25 to-transparent"></div>
              </div>

              <div className="relative w-full drop-shadow-xl aspect-[4/3] bg-gradient-to-br from-primary/20 to-purple-900/20 rounded-lg backdrop-blur-sm border border-primary/10">
                <Image
                  src="/hero-snap.png"
                  alt="AIcademics Platform Interface"
                  width={800}
                  height={600}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-2xl"
                />
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-purple-600/20 rounded-full blur-2xl"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="feature-card p-6 h-full">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Create your personalized learning experience in three simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              step: "01",
              title: "Choose Your Topic",
              description: "Enter the main subject you want to learn about",
            },
            {
              step: "02",
              title: "Add Subtopics",
              description:
                "Specify 3-8 subtopics to focus your learning journey",
            },
            {
              step: "03",
              title: "Get Your Course",
              description:
                "Receive an AI-curated course with matching video content",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="text-center p-6 feature-card rounded-lg"
            >
              <span className="gradient-text text-4xl font-bold mb-4 block">
                {item.step}
              </span>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-400">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Integrations Section */}
      <div className="">
        <Integrations />
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="feature-card rounded-2xl p-12 text-center max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Learning Experience?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already benefiting from
            AI-powered education
          </p>
          <Button
            size="lg"
            className="bg-[#A17BE0] hover:bg-[#A17BE0]/90 text-white px-8 py-6 rounded-full text-lg font-medium"
          >
            Get Started Free
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
          <div className=" mx-auto items-center justify-center flex mt-8">
            <GitStarButton />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
