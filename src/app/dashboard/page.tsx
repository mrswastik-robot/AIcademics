"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/ui/pagination";
import { Youtube, FileText, Link as LinkIcon, Search, Filter, Loader2 } from "lucide-react";
import Link from "next/link";

interface SavedContentItem {
  id: string;
  title: string;
  url: string;
  siteName?: string;
  contentType: string;
  content: any;
  tags: string[];
  notes?: string;
  summary?: string;
  savedAt: string;
}

// Content type icons
const contentTypeIcons = {
  youtube: <Youtube className="h-5 w-5 text-red-500" />,
  page: <FileText className="h-5 w-5 text-blue-500" />,
  selection: <LinkIcon className="h-5 w-5 text-green-500" />,
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [savedContent, setSavedContent] = useState<SavedContentItem[]>([]);
  const [contentType, setContentType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  
  // Check if user is authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);
  
  // Fetch saved content
  useEffect(() => {
    if (status === "authenticated") {
      fetchSavedContent();
    }
  }, [status, contentType, activeTag, searchTerm, pagination.page]);
  
  // Function to fetch saved content
  const fetchSavedContent = async () => {
    setIsLoading(true);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (contentType !== "all") {
        params.append("contentType", contentType);
      }
      if (activeTag) {
        params.append("tag", activeTag);
      }
      if (searchTerm) {
        params.append("search", searchTerm);
      }
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());
      
      // Fetch data from API
      const response = await fetch(`/api/content?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setSavedContent(data.data);
        setPagination(data.pagination);
      } else {
        console.error("Error fetching content:", data.error);
      }
    } catch (error) {
      console.error("Error fetching saved content:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle search
  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setPagination((prev) => ({ ...prev, page: 1 }));
      fetchSavedContent();
    }
  };
  
  // Function to extract all unique tags from content
  const getAllTags = () => {
    const tagsSet = new Set<string>();
    savedContent.forEach((item) => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag) => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet);
  };
  
  // Function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };
  
  // If loading or not authenticated yet
  if (status === "loading" || (status === "authenticated" && isLoading && savedContent.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading your knowledge base...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Access and search through your saved web content
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Button variant="default">
            <Link href="/create" className="flex items-center">
              Generate Course from Knowledge
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Search and filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your knowledge base..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleSearch}
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Content Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="page">Web Pages</SelectItem>
                    <SelectItem value="selection">Selections</SelectItem>
                    <SelectItem value="youtube">YouTube Videos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge
                variant={activeTag === "" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setActiveTag("")}
              >
                All
              </Badge>
              
              {getAllTags().map((tag) => (
                <Badge
                  key={tag}
                  variant={activeTag === tag ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setActiveTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Content listing */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : savedContent.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">No content found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {searchTerm || activeTag || contentType !== "all"
                    ? "Try adjusting your filters or search terms."
                    : "Use the AIcademics extension to save content to your knowledge base."}
                </p>
                {searchTerm || activeTag || contentType !== "all" ? (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm("");
                      setContentType("all");
                      setActiveTag("");
                    }}
                  >
                    Clear filters
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    className="mt-4"
                    onClick={() => window.open("https://chrome.google.com/webstore/detail/aicademics-knowledge-save/placeholder", "_blank")}
                  >
                    Get the Extension
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            savedContent.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    {contentTypeIcons[item.contentType as keyof typeof contentTypeIcons] || <LinkIcon className="h-5 w-5" />}
                    <CardDescription>
                      {item.contentType === "youtube"
                        ? "YouTube Video"
                        : item.contentType === "page"
                        ? "Web Page"
                        : "Selection"}
                       • {formatDate(item.savedAt)}
                    </CardDescription>
                  </div>
                  <CardTitle className="text-xl">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {item.title}
                    </a>
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.tags && Array.isArray(item.tags) && item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  {item.summary ? (
                    <p className="text-muted-foreground line-clamp-3">{item.summary}</p>
                  ) : (
                    <p className="text-muted-foreground line-clamp-3">
                      {item.content && typeof item.content === 'object' && item.content.text
                        ? item.content.text.substring(0, 250) + "..."
                        : "No content preview available"}
                    </p>
                  )}
                  
                  {item.notes && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="font-medium text-sm mb-1">Your Notes:</p>
                      <p className="text-sm text-muted-foreground">{item.notes}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex justify-between w-full">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary"
                    >
                      {item.siteName || new URL(item.url).hostname}
                    </a>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
        
        {/* Pagination */}
        {savedContent.length > 0 && pagination.pages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
} 