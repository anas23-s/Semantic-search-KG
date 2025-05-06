import { useState, useEffect } from 'react';
import { SearchItem, SearchResponse, ApiErrorResponse } from '../types';

export function useSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [exactMatch, setExactMatch] = useState<SearchItem | null>(null);
  const [similarNodes, setSimilarNodes] = useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setExactMatch(null);
      setSimilarNodes([]);
      setError(null);
      return;
    }

    const searchItems = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // First try GET method
        let response = await fetch(
          `http://127.0.0.1:5001/search?keyword=${encodeURIComponent(searchTerm)}&threshold=0.5`,
          {
            headers: {
              'Accept': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        );

        // If GET fails, try POST
        if (!response.ok) {
          response = await fetch('http://127.0.0.1:5001/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
              keyword: searchTerm,
              threshold: 0.5
            })
          });
        }

        const data = await response.json();
        console.log('API Response:', data); // Debug log

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch results');
        }

        // Handle successful response
        if (data.exact_match || data.similar_nodes) {
          // Process exact match
          const processedExactMatch = data.exact_match ? {
            ...data.exact_match,
            id: 'exact-match',
            label: Array.isArray(data.exact_match.label) ? data.exact_match.label[0] : data.exact_match.label,
            definition: Array.isArray(data.exact_match.definition) ? data.exact_match.definition[0] : data.exact_match.definition
          } : null;

          // Process similar nodes
          const processedSimilarNodes = (data.similar_nodes || []).map((node: any, index: number) => ({
            ...node,
            id: `similar-${index}`,
            label: Array.isArray(node.label) ? node.label[0] : node.label,
            definition: Array.isArray(node.definition) ? node.definition[0] : node.definition
          }));

          setExactMatch(processedExactMatch);
          setSimilarNodes(processedSimilarNodes);
        } else {
          setExactMatch(null);
          setSimilarNodes([]);
        }
      } catch (err) {
        console.error('Search error:', err);
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        setExactMatch(null);
        setSimilarNodes([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search for better performance
    const timeoutId = setTimeout(() => {
      searchItems();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const clearSearch = () => {
    setSearchTerm('');
    setExactMatch(null);
    setSimilarNodes([]);
    setError(null);
  };

  return {
    searchTerm,
    setSearchTerm,
    exactMatch,
    similarNodes,
    isLoading,
    error,
    clearSearch
  };
}