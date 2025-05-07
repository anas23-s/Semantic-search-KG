declare module 'react-cytoscapejs' {
  import { Component } from 'react';
  import { Core, ElementDefinition, LayoutOptions, Stylesheet } from 'cytoscape';

  interface CytoscapeComponentProps {
    elements: ElementDefinition[];
    style?: React.CSSProperties;
    layout?: LayoutOptions;
    stylesheet?: Stylesheet[];
    cy?: (cy: Core) => void;
    className?: string;
    id?: string;
  }

  export default class CytoscapeComponent extends Component<CytoscapeComponentProps> {}
} 