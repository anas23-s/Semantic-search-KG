import { useState, useRef, useEffect } from 'react';
import { Dialog, Tab } from '@headlessui/react';
import type { Core, ElementDefinition, LayoutOptions, StylesheetCSS } from 'cytoscape';
import CytoscapeComponent from 'react-cytoscapejs';

interface NodeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData: {
    metadata: Record<string, any>;
    wikipedia_uri: string | null;
    graph_paths: Array<{
      nodes: Array<{
        id: string;
        label: string;
        properties: Record<string, any>;
      }>;
      edges: Array<{
        source: string;
        target: string;
        type: string;
      }>;
    }>;
  } | null;
  isLoading: boolean;
  onNodeExpand?: (nodeId: string, relationType: string) => void;
}

function isValidUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function NodeDetailsModal({ isOpen, onClose, nodeData, isLoading, onNodeExpand }: NodeDetailsModalProps) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [relations, setRelations] = useState<string[]>([]);
  const [highlightedRelation, setHighlightedRelation] = useState<string | null>(null);
  const cyRef = useRef<Core | null>(null);

  // Reset sidebar state when modal is opened for a new node or nodeData changes
  useEffect(() => {
    setSelectedNodeId(null);
    setRelations([]);
    setHighlightedRelation(null);
    if (cyRef.current) {
      cyRef.current.elements('edge').removeClass('highlighted-relation');
    }
  }, [isOpen, nodeData]);

  const layout = {
    name: 'cose',
    idealEdgeLength: 100,
    nodeOverlap: 20,
    refresh: 20,
    fit: true,
    padding: 30,
    randomize: false,
    componentSpacing: 100,
    nodeRepulsion: 400000,
    edgeElasticity: 100,
    nestingFactor: 5,
    gravity: 80,
    numIter: 1000,
    initialTemp: 200,
    coolingFactor: 0.95,
    minTemp: 1.0
  };

  const stylesheet: StylesheetCSS[] = [
    {
      selector: 'node',
      css: {
        'background-color': '#4B9CD3',
        'label': 'data(label)',
        'text-wrap': 'wrap',
        'text-max-width': '150px',
        'font-size': '12px',
        'text-valign': 'center',
        'text-halign': 'center',
        'padding': '10px',
        'border-width': 2,
        'border-color': '#2B6CB0',
        'border-opacity': 0.8,
        'color': '#1A365D',
        'text-outline-color': '#fff',
        'text-outline-width': 2
      }
    },
    {
      selector: 'edge',
      css: {
        'width': 2,
        'line-color': '#718096',
        'target-arrow-color': '#718096',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'label': 'data(label)',
        'font-size': '10px',
        'text-rotation': 'autorotate',
        'text-margin-y': -10,
        'color': '#4A5568',
        'text-outline-color': '#fff',
        'text-outline-width': 2
      }
    },
    {
      selector: ':selected',
      css: {
        'background-color': '#2B6CB0',
        'line-color': '#2B6CB0',
        'target-arrow-color': '#2B6CB0',
        'source-arrow-color': '#2B6CB0',
        'text-outline-color': '#2B6CB0',
        'text-outline-width': 2
      }
    },
    {
      selector: '.highlighted-relation',
      css: {
        'line-color': '#f59e42',
        'target-arrow-color': '#f59e42',
        'width': 4,
        'z-index': 9999,
      }
    }
  ];

  const getGraphElements = () => {
    if (!nodeData?.graph_paths?.[0]) {
      console.log('No graph paths available');
      return [];
    }
    
    try {
      const { nodes, edges } = nodeData.graph_paths[0];
      console.log('Graph data:', { nodes, edges });
      
      const elements = [
        ...nodes.map(node => ({
          data: {
            id: node.id,
            label: node.label,
            ...node.properties
          }
        })),
        ...edges.map(edge => ({
          data: {
            source: edge.source,
            target: edge.target,
            label: edge.type
          }
        }))
      ];
      
      console.log('Cytoscape elements:', elements);
      return elements;
    } catch (error) {
      console.error('Error processing graph data:', error);
      return [];
    }
  };

  // Fetch relations for a node
  const fetchRelations = async (nodeId: string) => {
    try {
      const res = await fetch(`http://localhost:5001/node-relations?nodeId=${nodeId}`);
      if (!res.ok) throw new Error('Failed to fetch relations');
      const data = await res.json();
      setRelations(data.relations || []);
    } catch (e) {
      setRelations([]);
    }
  };

  // Highlight edges of a given relation type
  const highlightEdges = (relationType: string | null) => {
    setHighlightedRelation(relationType);
    if (cyRef.current) {
      cyRef.current.elements('edge').removeClass('highlighted-relation');
      if (relationType) {
        cyRef.current.elements(`edge[label = "${relationType}"]`).addClass('highlighted-relation');
      }
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-xl shadow-lg">
          <Dialog.Title className="text-lg font-medium p-4 border-b">
            Node Details
          </Dialog.Title>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading node details...</p>
            </div>
          ) : (
            <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
              <Tab.List className="flex space-x-1 p-4 border-b">
                <Tab
                  className={({ selected }) =>
                    `px-4 py-2 rounded-lg ${
                      selected
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  Metadata
                </Tab>
                <Tab
                  className={({ selected }) =>
                    `px-4 py-2 rounded-lg ${
                      selected
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  Graph View
                </Tab>
              </Tab.List>

              <Tab.Panels>
                <Tab.Panel className="p-4 overflow-y-auto max-h-[calc(100vh-20rem)]">
                  {nodeData && (
                    <div className="space-y-4">
                      {Object.entries(nodeData.metadata).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-3 gap-4">
                          <div className="font-medium text-gray-700">{key}:</div>
                          <div className="col-span-2 text-gray-900">
                            {Array.isArray(value) ? (
                              value.map((item, index) => (
                                <span key={index}>
                                  {isValidUrl(item) ? (
                                    <a
                                      href={item}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline"
                                    >
                                      {item}
                                    </a>
                                  ) : (
                                    item
                                  )}
                                  {index < value.length - 1 ? ', ' : ''}
                                </span>
                              ))
                            ) : (
                              isValidUrl(value) ? (
                                <a
                                  href={value}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline"
                                >
                                  {value}
                                </a>
                              ) : (
                                value
                              )
                            )}
                          </div>
                        </div>
                      ))}
                      {nodeData.wikipedia_uri && (
                        <div className="mt-4">
                          <a
                            href={nodeData.wikipedia_uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            View on Wikipedia
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </Tab.Panel>

                <Tab.Panel className="p-4">
                  <div className="h-[500px] border rounded-lg relative flex">
                    {/* Sidebar for relations */}
                    {selectedNodeId && relations.length > 0 && (
                      <div className="min-w-[14rem] max-w-xs bg-gray-50 border-r h-full p-2 overflow-y-auto">
                        <div className="font-semibold mb-2">Relations</div>
                        {relations.filter(rel => rel !== 'wikiPage').map((rel) => (
                          <button
                            key={rel}
                            className={`block w-full text-left px-2 py-1 rounded mb-1 break-words whitespace-normal ${highlightedRelation === rel ? 'bg-orange-200' : 'hover:bg-gray-200'}`}
                            style={{ wordBreak: 'break-word' }}
                            onClick={() => {
                              if (onNodeExpand) onNodeExpand(selectedNodeId, rel);
                              highlightEdges(rel);
                            }}
                          >
                            {rel}
                          </button>
                        ))}
                        <button
                          className="block w-full text-left px-2 py-1 rounded mt-2 bg-gray-200"
                          onClick={() => {
                            setSelectedNodeId(null);
                            setRelations([]);
                            highlightEdges(null);
                          }}
                        >
                          Clear Selection
                        </button>
                      </div>
                    )}
                    {/* Graph area */}
                    <div className="flex-1 relative">
                      {nodeData ? (
                        getGraphElements().length > 0 ? (
                          <>
                            <CytoscapeComponent
                              elements={getGraphElements()}
                              style={{ width: '100%', height: '100%' }}
                              layout={layout}
                              stylesheet={stylesheet}
                              cy={(cy) => {
                                cyRef.current = cy;
                                cy.on('tap', 'node', async (evt) => {
                                  const node = evt.target;
                                  const nodeId = node.id();
                                  node.select();
                                  setSelectedNodeId(nodeId);
                                  await fetchRelations(nodeId);
                                });
                                cy.on('tap', (event) => {
                                  if (event.target === cy) {
                                    cy.elements().unselect();
                                    setSelectedNodeId(null);
                                    setRelations([]);
                                    highlightEdges(null);
                                  }
                                });
                                
                                // Zoom controls
                                cy.on('mousewheel', (evt) => {
                                  if (evt.originalEvent instanceof WheelEvent && evt.originalEvent.ctrlKey) {
                                    evt.preventDefault();
                                    const zoom = cy.zoom();
                                    const factor = evt.originalEvent.deltaY > 0 ? 0.9 : 1.1;
                                    cy.zoom({
                                      level: zoom * factor,
                                      renderedPosition: {
                                        x: evt.renderedPosition.x,
                                        y: evt.renderedPosition.y
                                      }
                                    });
                                  }
                                });

                                // Add zoom buttons
                                const zoomIn = document.createElement('button');
                                zoomIn.innerHTML = '+';
                                zoomIn.className = 'absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-lg font-bold cursor-pointer hover:bg-gray-100';
                                zoomIn.onclick = () => cy.zoom(cy.zoom() * 1.2);

                                const zoomOut = document.createElement('button');
                                zoomOut.innerHTML = '-';
                                zoomOut.className = 'absolute top-12 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-lg font-bold cursor-pointer hover:bg-gray-100';
                                zoomOut.onclick = () => cy.zoom(cy.zoom() * 0.8);

                                const reset = document.createElement('button');
                                reset.innerHTML = '↺';
                                reset.className = 'absolute top-22 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-lg font-bold cursor-pointer hover:bg-gray-100';
                                reset.onclick = () => {
                                  cy.fit();
                                  cy.center();
                                };

                                const container = cy.container();
                                if (container) {
                                  container.appendChild(zoomIn);
                                  container.appendChild(zoomOut);
                                  container.appendChild(reset);
                                }
                              }}
                            />
                            <div className="absolute bottom-2 left-2 text-sm text-gray-500">
                              {nodeData.graph_paths[0].nodes.length} nodes, {nodeData.graph_paths[0].edges.length} edges
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            No graph data available
                          </div>
                        )
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                          No data available
                        </div>
                      )}
                    </div>
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          )}

          <div className="p-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
} 