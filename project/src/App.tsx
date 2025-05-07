import { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { NodeDetailsModal } from './components/NodeDetailsModal';

interface SearchResult {
  exact_match: {
    label: string;
    definition: string;
    similarity: number;
  } | null;
  similar_nodes: Array<{
    label: string;
    definition: string;
    similarity: number;
  }>;
}

const ITEMS_PER_PAGE = 9;
const MAX_VISIBLE_PAGES = 5;

function App() {
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isNodeDetailsLoading, setIsNodeDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nodeDetails, setNodeDetails] = useState<any>(null);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSearch = async (keyword: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentSearchTerm(keyword);
    setCurrentPage(1); // Reset to first page on new search
    
    try {
      const response = await fetch('http://localhost:5001/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodeClick = async (label: string) => {
    try {
      setIsNodeDetailsLoading(true);
      setError(null);
      
      const response = await fetch(
        `http://localhost:5001/node-details?clickedLabel=${encodeURIComponent(label)}&searchedLabel=${encodeURIComponent(currentSearchTerm)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch node details');
      }

      const data = await response.json();
      setNodeDetails(data);
      setIsModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load node details');
      setIsModalOpen(false);
    } finally {
      setIsNodeDetailsLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNodeDetails(null);
  };

  const getPaginatedResults = () => {
    if (!searchResults?.similar_nodes) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return searchResults.similar_nodes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const totalPages = searchResults?.similar_nodes 
    ? Math.ceil(searchResults.similar_nodes.length / ITEMS_PER_PAGE)
    : 0;

  const getVisiblePages = () => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfVisible = Math.floor(MAX_VISIBLE_PAGES / 2);
    let start = Math.max(1, currentPage - halfVisible);
    let end = Math.min(totalPages, start + MAX_VISIBLE_PAGES - 1);

    if (end - start + 1 < MAX_VISIBLE_PAGES) {
      start = Math.max(1, end - MAX_VISIBLE_PAGES + 1);
    }

    const pages = [];
    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Energy Knowledge Graph Search</h1>
        
        <SearchBar onSearch={handleSearch} />

        {isLoading && (
          <div className="text-center mt-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {searchResults && (
          <div className="mt-8 space-y-6">
            {searchResults.exact_match && (
              <div 
                className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleNodeClick(searchResults.exact_match!.label)}
              >
                <h2 className="text-xl font-semibold mb-2">{searchResults.exact_match.label}</h2>
                <p className="text-gray-600">{searchResults.exact_match.definition}</p>
                <div className="mt-2 text-sm text-blue-600">Exact Match (100% similarity)</div>
                {isNodeDetailsLoading && (
                  <div className="mt-2 text-sm text-gray-500">
                    Loading details...
                  </div>
                )}
              </div>
            )}

            {searchResults.similar_nodes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Similar Concepts</h3>
                <div className="space-y-4">
                  {getPaginatedResults().map((node, index) => (
                    <div 
                      key={index} 
                      className="bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleNodeClick(node.label)}
                    >
                      <h4 className="font-medium">{node.label}</h4>
                      <p className="text-gray-600 mt-1">{node.definition}</p>
                      <div className="mt-2 text-sm text-gray-500">
                        Similarity: {node.similarity.toFixed(2)}%
                      </div>
                      {isNodeDetailsLoading && (
                        <div className="mt-2 text-sm text-gray-500">
                          Loading details...
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                          <span className="font-medium">
                            {Math.min(currentPage * ITEMS_PER_PAGE, searchResults.similar_nodes.length)}
                          </span>{' '}
                          of{' '}
                          <span className="font-medium">{searchResults.similar_nodes.length}</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                          <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Previous</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                            </svg>
                          </button>
                          
                          {getVisiblePages().map((page, index) => (
                            page === '...' ? (
                              <span
                                key={`ellipsis-${index}`}
                                className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0"
                              >
                                ...
                              </span>
                            ) : (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page as number)}
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                  currentPage === page
                                    ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                }`}
                              >
                                {page}
                              </button>
                            )
                          ))}

                          <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Next</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <NodeDetailsModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        nodeData={nodeDetails}
        isLoading={isNodeDetailsLoading}
      />
    </div>
  );
}

export default App;