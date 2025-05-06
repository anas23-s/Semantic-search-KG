import React from 'react';
import { SearchItem } from '../types';

interface ResultItemProps {
  item: SearchItem;
  isExactMatch: boolean;
}

const ResultItem: React.FC<ResultItemProps> = ({ item, isExactMatch }) => {
  // Handle both array and string formats for label and definition
  const label = Array.isArray(item.label) ? item.label[0] : item.label;
  const definition = Array.isArray(item.definition) ? item.definition[0] : item.definition;
  const similarity = typeof item.similarity === 'number' ? item.similarity : 0;

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow ${
      isExactMatch ? 'border-2 border-green-200' : ''
    }`}>
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
          isExactMatch 
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {isExactMatch ? 'Exact Match' : `Similarity: ${similarity.toFixed(2)}%`}
        </span>
      </div>
      <p className="mt-2 text-gray-600">{definition}</p>
    </div>
  );
};

export default ResultItem;