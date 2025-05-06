import React from 'react';
import { SearchItem } from '../types';
import ResultItem from './ResultItem';
import { FileSearch, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ResultsListProps {
  exactMatch: SearchItem | null;
  similarNodes: SearchItem[];
  isLoading: boolean;
  searchTerm: string;
  error: string | null;
}

const ResultsList: React.FC<ResultsListProps> = ({ 
  exactMatch, 
  similarNodes, 
  isLoading, 
  searchTerm, 
  error 
}) => {
  // Don't show anything if search hasn't been initiated
  if (searchTerm.trim() === '') {
    return (
      <div className="mt-8 text-center text-gray-500">
        <p>Enter a keyword to start searching</p>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="mt-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        <p className="mt-2 text-gray-600">Searching...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mt-8 text-center">
        <div className="inline-flex justify-center items-center">
          <AlertCircle size={40} className="text-red-500" />
        </div>
        <p className="mt-2 text-red-600">{error}</p>
        <p className="mt-1 text-gray-500 text-sm">Try adjusting your search term</p>
      </div>
    );
  }

  // No results found
  if (!exactMatch && similarNodes.length === 0) {
    return (
      <div className="mt-8 text-center">
        <div className="inline-flex justify-center items-center">
          <FileSearch size={40} className="text-gray-400" />
        </div>
        <p className="mt-2 text-gray-600">No results found for "{searchTerm}"</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6 animate-fade-in">
      {exactMatch && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={20} className="text-green-500" />
            <h2 className="text-lg font-semibold text-gray-700">Exact Match</h2>
          </div>
          <ResultItem key="exact-match" item={exactMatch} isExactMatch={true} />
        </div>
      )}
      
      {similarNodes.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-700">
            Similar Results {exactMatch && `(${similarNodes.length})`}
          </h2>
          <div className="space-y-3">
            {similarNodes.map((item, index) => (
              <ResultItem 
                key={`similar-${index}`} 
                item={item} 
                isExactMatch={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsList;