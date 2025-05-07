import { useState } from 'react';
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
}

function isValidUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function NodeDetailsModal({ isOpen, onClose, nodeData }: NodeDetailsModalProps) {
  const [selectedTab, setSelectedTab] = useState(0);

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
    }
  ];

  const getGraphElements = () => {
    if (!nodeData?.graph_paths[0]) {
      console.log('No graph paths available');
      return [];
    }
    
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
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-xl shadow-lg">
          <Dialog.Title className="text-lg font-medium p-4 border-b">
            Node Details
          </Dialog.Title>

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
              <Tab.Panel className="p-4">
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
                <div className="h-[500px] border rounded-lg relative">
                  {nodeData && (
                    <>
                      <CytoscapeComponent
                        elements={getGraphElements()}
                        style={{ width: '100%', height: '100%' }}
                        layout={layout}
                        stylesheet={stylesheet}
                        cy={(cy) => {
                          // Node click handler
                          cy.on('tap', 'node', (evt) => {
                            const node = evt.target;
                            node.select();
                          });
                          
                          // Zoom controls
                          cy.on('mousewheel', (evt) => {
                            evt.preventDefault();
                            const zoom = cy.zoom();
                            const wheelDelta = evt.originalEvent instanceof WheelEvent ? evt.originalEvent.deltaY : 0;
                            const factor = wheelDelta > 0 ? 0.9 : 1.1;
                            cy.zoom({
                              level: zoom * factor,
                              renderedPosition: { x: evt.renderedPosition.x, y: evt.renderedPosition.y }
                            });
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
                  )}
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

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