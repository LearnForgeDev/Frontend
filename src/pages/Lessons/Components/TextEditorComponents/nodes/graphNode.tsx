import {
  DecoratorNode,
  type DOMConversionMap,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical';
import type {JSX} from "react";
import GraphComponent from "./GraphNodeComponent.tsx";

export interface GraphPayload {
  key?: NodeKey;
}

export type SerializedGraphNode = Spread<
  object,
  SerializedLexicalNode
>;

export class GraphNode extends DecoratorNode<JSX.Element> {
  static getType(): string {
    return "graph";
  }

  static clone(node: GraphNode): GraphNode {
    return new GraphNode(node.__key);
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement("span");
    const className = config.theme.graph;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): false {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("div");
    element.className = "graph-node";
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
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

  exportJSON(): SerializedGraphNode {
    return {
      type: "graph",
      version: 1,
    };
  }

  static importJSON(): GraphNode {
    return $createGraphNode();
  }

  decorate(): JSX.Element {
    return (
      <GraphComponent
        nodeKey={this.getKey()}
      />
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
