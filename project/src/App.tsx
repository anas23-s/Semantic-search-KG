import { useState, useCallback } from 'react';
import { SearchBar } from './components/SearchBar';
import { NodeDetailsModal } from './components/NodeDetailsModal';
import AdminRoleInfo from './components/AdminRoleInfo';
import UserMenu from './components/UserMenu';

// --- START: Type definitions for graph data (consistent with NodeDetailsModal) ---
interface GraphNode {
  id: string;
  label: string;
  properties: Record<string, any>;
}

interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

interface GraphPath {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface NodeData { // This will be the type for nodeDetails state
  metadata: Record<string, any>;
  wikipedia_uri: string | null;
  graph_paths: GraphPath[];
}
// --- END: Type definitions ---

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
  const [nodeDetails, setNodeDetails] = useState<NodeData | null>(null);
  const [currentSearchTerm, setCurrentSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isGraphExpanding, setIsGraphExpanding] = useState(false);

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
    setIsGraphExpanding(false);
  };

  const handleNodeExpand = useCallback(async (nodeId: string, relationType: string) => {
    if (!nodeDetails?.graph_paths?.[0]) {
      console.warn("Cannot expand node, current graph data (nodeDetails) is missing or ill-formatted.");
      return;
    }

    setIsGraphExpanding(true);
    try {
      const response = await fetch('http://localhost:5001/expand-node', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodeId, relationType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to expand node from API');
      }

      const { newNodes, newEdges } = (await response.json()) as { newNodes: GraphNode[], newEdges: GraphEdge[] };

      if (newNodes.length > 0 || newEdges.length > 0) {
        setNodeDetails(prevDetails => {
          if (!prevDetails || !prevDetails.graph_paths?.[0]) return prevDetails;

          const currentGraphPath = prevDetails.graph_paths[0];
          
          const existingNodeIds = new Set(currentGraphPath.nodes.map(n => n.id));
          const uniqueNewNodes = newNodes.filter(n => !existingNodeIds.has(n.id));

          const existingEdgeSignatures = new Set(
            currentGraphPath.edges.map(e => `${e.source}-${e.target}-${e.type}`)
          );
          const uniqueNewEdges = newEdges.filter(
            e => !existingEdgeSignatures.has(`${e.source}-${e.target}-${e.type}`)
          );

          if (uniqueNewNodes.length === 0 && uniqueNewEdges.length === 0) {
            console.log("No new unique nodes or edges to add from expansion.");
            return prevDetails;
          }
          
          const updatedGraphPath: GraphPath = {
            nodes: [...currentGraphPath.nodes, ...uniqueNewNodes],
            edges: [...currentGraphPath.edges, ...uniqueNewEdges],
          };

          return {
            ...prevDetails,
            graph_paths: [updatedGraphPath, ...prevDetails.graph_paths.slice(1)],
          };
        });
      } else {
        console.log("Expansion returned no new nodes or edges.");
      }
    } catch (error) {
      console.error("Failed to expand node:", error);
      setError(error instanceof Error ? error.message : 'Failed to expand graph node');
    } finally {
      setIsGraphExpanding(false);
    }
  }, [nodeDetails]);

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

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 90) return 'bg-green-100 text-green-800';
    if (similarity >= 70) return 'bg-blue-100 text-blue-800';
    if (similarity >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatSimilarity = (similarity: number) => {
    if (similarity >= 99.99) return '99.99';
    return similarity.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-800">Energy Knowledge Graph</h1>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <SearchBar onSearch={handleSearch} />
          
          {isLoading && (
            <div className="flex justify-center items-center mt-6">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        {searchResults && (
          <div className="space-y-6">
            {/* Exact Match */}
            {searchResults.exact_match && (
              <div 
                className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleNodeClick(searchResults.exact_match!.label)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {searchResults.exact_match.label}
                    </h2>
                    <p className="text-gray-600">{searchResults.exact_match.definition}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Exact Match
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      100% Match
                    </span>
                  </div>
                </div>
                {isNodeDetailsLoading && (
                  <div className="mt-4 text-sm text-gray-500">
                    Loading details...
                  </div>
                )}
              </div>
            )}

            {/* Similar Results */}
            {searchResults.similar_nodes.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Concepts</h3>
                <div className="space-y-4">
                  {getPaginatedResults().map((node, index) => (
                    <div 
                      key={index} 
                      className="p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 cursor-pointer transition-colors"
                      onClick={() => handleNodeClick(node.label)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{node.label}</h4>
                          <p className="text-gray-600 mt-1">{node.definition}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 ml-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSimilarityColor(node.similarity)}`}>
                            {node.similarity >= 90 ? 'High Match' : 
                             node.similarity >= 70 ? 'Good Match' : 
                             node.similarity >= 50 ? 'Partial Match' : 'Low Match'}
                          </span>
                          <span className="text-sm font-medium text-gray-600">
                            {formatSimilarity(node.similarity)}% Match
                          </span>
                        </div>
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
                  <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
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
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Previous</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </button>
                          
                          {getVisiblePages().map((page, index) => (
                            page === '...' ? (
                              <span
                                key={`ellipsis-${index}`}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                              >
                                ...
                              </span>
                            ) : (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page as number)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === page
                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            )
                          ))}

                          <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Next</span>
                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
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
      </main>

      <NodeDetailsModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        nodeData={nodeDetails}
        isLoading={isNodeDetailsLoading || isGraphExpanding}
        onNodeExpand={handleNodeExpand}
      />
    </div>
  );
}

export default App;