"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface SearchResult {
  contentId: string;
  title: string;
  url: string;
  siteName?: string;
  contentType: string;
  relevanceScore: number;
  snippet: string;
}

// Mock data for development
const MOCK_SEARCH_RESULTS: SearchResult[] = [
  {
    contentId: "1",
    title: "Vector Databases for Machine Learning",
    url: "https://example.com/vector-databases",
    siteName: "Example Tech Blog",
    contentType: "page",
    relevanceScore: 0.92,
    snippet: "Vector databases are specialized database systems designed to store, index, and query high-dimensional vectors efficiently. These vectors commonly represent embeddings of data items like text, images, or audio in machine learning applications..."
  },
  {
    contentId: "2",
    title: "Building Chrome Extensions with Manifest V3",
    url: "https://developer.chrome.com/docs/extensions/mv3/intro/",
    siteName: "Chrome Developer",
    contentType: "page",
    relevanceScore: 0.87,
    snippet: "Manifest V3 is a new extension platform introduced by Chrome that brings improved security, privacy, and performance to extensions. This article explains the key concepts and how to migrate existing extensions..."
  },
  {
    contentId: "3",
    title: "Web Scraping Best Practices",
    url: "https://example.com/scraping-best-practices",
    siteName: "Data Science Blog",
    contentType: "selection",
    relevanceScore: 0.78,
    snippet: "When implementing web scraping tools, it's important to be respectful of the websites you're scraping. This includes respecting robots.txt, implementing rate limiting, identifying your scraper properly, and minimizing the load on the target servers..."
  }
];

const MOCK_AI_ANSWER = "Vector databases are specialized database systems designed to store and query high-dimensional vectors efficiently. They're crucial for machine learning applications, especially for similarity search and recommendation systems. Unlike traditional databases that use exact matching, vector databases can find items that are semantically similar based on the distance between vectors in a high-dimensional space. Popular vector database options include Pinecone, Milvus, Weaviate, and Qdrant. They offer features like approximate nearest neighbor search algorithms, which make similarity searches scalable even with millions of items.";

export default function SearchKnowledgeBase() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [useRAG, setUseRAG] = useState(true);
  const [useMockData, setUseMockData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsSearching(true);
    setResults([]);
    setAnswer(null);
    setError(null);
    
    // Use mock data if in development mode or if specified
    if (useMockData) {
      setTimeout(() => {
        setResults(MOCK_SEARCH_RESULTS);
        if (useRAG) {
          setAnswer(MOCK_AI_ANSWER);
        }
        setIsSearching(false);
      }, 1000); // Simulate network delay
      return;
    }
    
    try {
      const searchParams = new URLSearchParams();
      searchParams.append("query", query);
      searchParams.append("limit", "5");
      if (useRAG) searchParams.append("rag", "true");
      
      const response = await fetch(`/api/content/search?${searchParams.toString()}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        if (data.results && data.results.length > 0) {
          setResults(data.results);
          setAnswer(data.answer || null);
        } else {
          // No results - fall back to mock data
          console.log("No search results found, using mock data");
          setResults(MOCK_SEARCH_RESULTS);
          if (useRAG) {
            setAnswer(MOCK_AI_ANSWER);
          }
          setUseMockData(true);
          setError("No matching content in your knowledge base. Showing sample results.");
        }
      } else {
        console.error("Search error:", data.error);
        setError("Search failed. Using sample data instead.");
        // Fall back to mock data on error
        setResults(MOCK_SEARCH_RESULTS);
        if (useRAG) {
          setAnswer(MOCK_AI_ANSWER);
        }
        setUseMockData(true);
      }
    } catch (error) {
      console.error("Error performing search:", error);
      setError("Failed to connect to the server. Using sample data instead.");
      // Fall back to mock data on error
      setResults(MOCK_SEARCH_RESULTS);
      if (useRAG) {
        setAnswer(MOCK_AI_ANSWER);
      }
      setUseMockData(true);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ask a question about your saved content..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isSearching}>
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching
            </>
          ) : (
            "Search"
          )}
        </Button>
      </form>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="useRag"
          checked={useRAG}
          onChange={(e) => setUseRAG(e.target.checked)}
          className="rounded border-gray-300"
        />
        <label htmlFor="useRag" className="text-sm text-muted-foreground">
          Generate answer using AI
        </label>
      </div>
      
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-800">Note</h3>
            <p className="text-sm text-yellow-700 mt-1">{error}</p>
          </div>
        </div>
      )}
      
      {useMockData && !error && query && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-800">Development Mode</h3>
            <p className="text-sm text-blue-700 mt-1">Displaying sample search results for development purposes.</p>
          </div>
        </div>
      )}
      
      {answer && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">AI Answer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{answer}</p>
          </CardContent>
        </Card>
      )}
      
      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Relevant Content</h3>
          {results.map((result) => (
            <Card key={result.contentId} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-md">
                    <Link
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-blue-600"
                    >
                      {result.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    Score: {Math.round(result.relevanceScore * 100)}%
                  </CardDescription>
                </div>
                <CardDescription>
                  {result.siteName || new URL(result.url).hostname} • {result.contentType}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{result.snippet}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {isSearching && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {!isSearching && query && results.length === 0 && !error && (
        <div className="text-center py-8 text-muted-foreground">
          No matching content found. Try a different query.
        </div>
      )}
    </div>
  );
} 