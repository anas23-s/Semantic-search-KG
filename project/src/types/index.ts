export interface SearchItem {
  id: string;
  label: string[];
  definition: string[];
  similarity: number;
}

export interface SearchResponse {
  exact_match: SearchItem | null;
  similar_nodes: SearchItem[];
}

export interface ApiErrorResponse {
  error: string;
}