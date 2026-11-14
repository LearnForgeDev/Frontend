import type { GraphPayload, SerializedGraphNode } from './graphNode.type';
export type { GraphPayload, SerializedGraphNode } from './graphNode.type';
import { DecoratorNode, type DOMConversionMap, type DOMExportOutput, type EditorConfig, type LexicalNode, type NodeKey } from 'lexical';
import type { JSX } from 'react';
import * as React from 'react';

const GraphComponent = React.lazy(() => import('./GraphNodeComponent.tsx'));

export class GraphNode extends DecoratorNode<JSX.Element> {
  static override getType(): string {
    return "graph";
  }

  static override clone(node: GraphNode): GraphNode {
    return new GraphNode(node.__key);
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  override createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement("span");
    const className = config.theme.graph;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  override updateDOM(): false {
    return false;
  }

  override exportDOM(): DOMExportOutput {
    const element = document.createElement("div");
    element.className = "graph-node";
    return { element };
  }

  static override importDOM(): DOMConversionMap | null {
    return {
      div: (node: Node) => {
        if ((node as HTMLElement).className === "graph-node") {
          return {
            conversion: () => {
              const node = $createGraphNode();
              return { node };
            },
            priority: 0,
          };
        }
        return null;
      },
    };
  }

  override exportJSON(): SerializedGraphNode {
    return {
      type: "graph",
      version: 1,
    };
  }

  static override importJSON(): GraphNode {
    return $createGraphNode();
  }

  override decorate(): JSX.Element {
    return (
      <React.Suspense fallback={null}>
        <GraphComponent
          nodeKey={this.getKey()}
        />
      </React.Suspense>
    );
  }
}

export function $createGraphNode({
  key,
}: GraphPayload = {}): GraphNode {
  return new GraphNode(key);
}

export function $isGraphNode(
  node: LexicalNode | null | undefined
): node is GraphNode {
  return node instanceof GraphNode;
}
