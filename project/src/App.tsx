import React from 'react';
import SearchBar from './components/SearchBar';
import ResultsList from './components/ResultsList';
import { useSearch } from './hooks/useSearch';

function App() {
  const { 
    searchTerm, 
    setSearchTerm, 
    exactMatch,
    similarNodes,
    isLoading, 
    error, 
    clearSearch 
  } = useSearch();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Smart Search</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Enter a keyword to search for concepts in the knowledge graph.
          </p>
        </header>

        <main className="max-w-3xl mx-auto">
          <SearchBar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            clearSearch={clearSearch}
            isLoading={isLoading}
          />
          
          <ResultsList 
            exactMatch={exactMatch}
            similarNodes={similarNodes}
            isLoading={isLoading}
            searchTerm={searchTerm}
            error={error}
          />
        </main>

        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Smart Search. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;