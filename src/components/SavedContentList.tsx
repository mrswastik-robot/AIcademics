"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Youtube, FileText, Link as LinkIcon, ArrowRight, Trash, AlertCircle } from "lucide-react";
import { SavedContent } from "@/types/saved-content";

// Mock data for development and testing
const MOCK_SAVED_CONTENT: SavedContent[] = [
  {
    id: "1",
    title: "How to Build a Chrome Extension",
    url: "https://developer.chrome.com/docs/extensions/mv3/getstarted/",
    contentType: "page",
    notes: "Useful guide for building extensions with Manifest V3",
    categories: ["development", "chrome", "extension"],
    createdAt: "2023-04-15T12:00:00Z",
    updatedAt: "2023-04-15T12:00:00Z"
  },
  {
    id: "2",
    title: "Introduction to Vector Databases",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    contentType: "youtube",
    notes: "Great explanation of how vector databases work for ML applications",
    categories: ["database", "machine-learning", "vectors"],
    createdAt: "2023-04-16T14:30:00Z",
    updatedAt: "2023-04-16T14:30:00Z"
  },
  {
    id: "3",
    title: "The importance of well-designed user interfaces",
    url: "https://uxdesign.cc/why-ui-design-matters-66f9f15ddb53",
    contentType: "selection",
    notes: "Key passage about the impact of good UI on user retention",
    categories: ["design", "ui", "ux"],
    createdAt: "2023-04-17T09:15:00Z",
    updatedAt: "2023-04-17T09:15:00Z"
  }
];

export default function SavedContentList() {
  const [savedContent, setSavedContent] = useState<SavedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("");
  const [useMockData, setUseMockData] = useState(false);
  
  useEffect(() => {
    const fetchSavedContent = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (useMockData) {
          // Use mock data for testing
          setTimeout(() => {
            setSavedContent(MOCK_SAVED_CONTENT);
            setTotalPages(1);
            setLoading(false);
          }, 500); // Simulate network delay
          return;
        }
        
        const params = new URLSearchParams();
        params.append("page", page.toString());
        params.append("limit", "10");
        
        if (filter) {
          params.append("search", filter);
        }
        
        const response = await fetch(`/api/saved-content?${params.toString()}`);
        const data = await response.json();
        
        if (response.ok) {
          if (data.items && data.items.length > 0) {
            setSavedContent(data.items);
            setTotalPages(Math.ceil(data.total / 10) || 1);
          } else {
            // If no real data, fall back to mock data
            console.log("No saved content found, using mock data");
            setSavedContent(MOCK_SAVED_CONTENT);
            setTotalPages(1);
            setUseMockData(true);
          }
        } else {
          console.error("Error fetching saved content:", data.error);
          setError(data.error || "Failed to fetch content");
          // Fall back to mock data on error
          setSavedContent(MOCK_SAVED_CONTENT);
          setTotalPages(1);
          setUseMockData(true);
        }
      } catch (error) {
        console.error("Failed to fetch saved content", error);
        setError("Failed to connect to the server. Using sample data instead.");
        // Fall back to mock data on error
        setSavedContent(MOCK_SAVED_CONTENT);
        setTotalPages(1);
        setUseMockData(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSavedContent();
  }, [page, filter]);
  
  // Helper function to get appropriate icon based on content type
  const getContentTypeIcon = (contentType: string) => {
    switch (contentType?.toLowerCase()) {
      case 'youtube':
        return <Youtube className="w-5 h-5 text-red-500" />;
      case 'selection':
        return <LinkIcon className="w-5 h-5 text-green-500" />;
      case 'page':
      default:
        return <FileText className="w-5 h-5 text-blue-500" />;
    }
  };
  
  const handleDeleteContent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this content?")) {
      return;
    }
    
    if (useMockData) {
      // Just remove from local state for mock data
      setSavedContent(prevContent => prevContent.filter(item => item.id !== id));
      return;
    }
    
    try {
      const response = await fetch(`/api/content/delete?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Refresh content list
        setSavedContent(prevContent => prevContent.filter(item => item.id !== id));
      } else {
        console.error("Failed to delete content");
      }
    } catch (error) {
      console.error("Error deleting content:", error);
    }
  };
  
  if (loading && savedContent.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (savedContent.length === 0 && !error) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-muted-foreground">No saved content yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">Start saving content from websites to see them here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800">Connection Issue</h3>
            <p className="text-sm text-yellow-700 mt-1">{error}</p>
          </div>
        </div>
      )}
      
      {useMockData && !error && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800">Development Mode</h3>
            <p className="text-sm text-blue-700 mt-1">Displaying sample data for development purposes.</p>
          </div>
        </div>
      )}
      
      {savedContent.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="mt-1">
                {getContentTypeIcon(item.contentType || 'page')}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start gap-2">
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-lg font-medium hover:text-primary hover:underline line-clamp-1"
                  >
                    {item.title}
                  </a>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {item.url}
                </p>
                
                {item.notes && (
                  <p className="mt-2 text-sm line-clamp-3">{item.notes}</p>
                )}
                
                <div className="mt-3 flex gap-2 flex-wrap">
                  {item.categories?.map((category) => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>
                
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" className="flex gap-1.5 items-center">
                    View Details
                    <ArrowRight size={14} />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteContent(item.id)}
                  >
                    <Trash size={14} className="mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {totalPages > 1 && (
        <Pagination 
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
} 