import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const generatePages = () => {
    const pages = [];
    const maxVisible = 5; // Maximum number of visible page buttons
    
    if (totalPages <= maxVisible) {
      // Show all pages if there are fewer than maxVisible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include page 1
      pages.push(1);
      
      // Calculate the range of visible pages
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Add ellipsis after page 1 if needed
      if (startPage > 2) {
        pages.push(-1); // -1 represents ellipsis
      }
      
      // Add the range of visible pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before the last page if needed
      if (endPage < totalPages - 1) {
        pages.push(-2); // -2 represents ellipsis (using a different value to avoid React key conflicts)
      }
      
      // Always include the last page
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  if (totalPages <= 1) return null;
  
  return (
    <div className={cn("flex justify-center items-center space-x-1", className)}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {generatePages().map((page, index) => {
        if (page < 0) {
          return (
            <span
              key={`ellipsis-${page}`}
              className="w-9 h-9 flex items-center justify-center text-muted-foreground"
            >
              ...
            </span>
          );
        }
        
        return (
          <Button
            key={`page-${page}`}
            variant={currentPage === page ? "default" : "outline"}
            onClick={() => onPageChange(page)}
            className="w-9 h-9"
          >
            {page}
          </Button>
        );
      })}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
} 