export interface SavedContent {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  contentType?: string;
  content?: string;
  notes?: string;
  categories?: string[];
  createdAt: string;
  updatedAt: string;
} 