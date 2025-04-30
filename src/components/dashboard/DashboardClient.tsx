"use client";

import { useState } from "react";
import { Youtube, FileText, Link as LinkIcon } from "lucide-react";
import Tabs from "@/components/Tabs";
import SavedContentList from "@/components/SavedContentList";
import SearchKnowledgeBase from "@/components/SearchKnowledgeBase";

export default function DashboardClient() {
  // Content type icons for reference
  const contentTypeIcons = {
    youtube: <Youtube className="h-5 w-5 text-red-500" />,
    page: <FileText className="h-5 w-5 text-blue-500" />,
    selection: <LinkIcon className="h-5 w-5 text-green-500" />,
  };

  const tabItems = [
    {
      key: "recent",
      label: "Recent Saves",
      content: <SavedContentList />
    },
    {
      key: "search",
      label: "Search",
      content: <SearchKnowledgeBase />
    }
  ];

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-6">Your Knowledge Base</h1>
      <Tabs items={tabItems} />
    </div>
  );
} 