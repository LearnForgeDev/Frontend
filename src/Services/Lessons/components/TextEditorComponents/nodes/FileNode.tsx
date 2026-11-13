import type { FilePayload, SerializedFileNode } from './FileNode.type';
export type { FilePayload, SerializedFileNode } from './FileNode.type';
import { DecoratorNode, type DOMConversionMap, type DOMExportOutput, type EditorConfig, type LexicalNode, type NodeKey } from "lexical";
import type { JSX } from 'react';
import FileComponent from './FileComponent.tsx';

export class FileNode extends DecoratorNode<JSX.Element> {
  __fileName: string;
  __url: string;
  __sizeBytes?: number;

  static override getType(): string {
    return "file";
  }

  static override clone(node: FileNode): FileNode {
    return new FileNode(
      node.__fileName,
      node.__url,
      node.__sizeBytes,
      node.__key
    );
  }

  constructor(
    fileName: string,
    url: string,
    sizeBytes?: number,
    key?: NodeKey
  ) {
    super(key);
    this.__fileName = fileName;
    this.__url = url;
    this.__sizeBytes = sizeBytes;
  }

  override createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement("span");
    const className = config.theme.file;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  override updateDOM(): false {
    return false;
  }

  override exportDOM(): DOMExportOutput {
    const element = document.createElement("a");
    element.setAttribute("href", this.__url);
    element.setAttribute("download", this.__fileName);
    element.textContent = `📎 ${this.__fileName}`;
    return { element };
  }

  static override importDOM(): DOMConversionMap | null {
    return {
      a: () => ({
        conversion: (element: HTMLElement) => {
          if (element instanceof HTMLAnchorElement && element.hasAttribute('download')) {
            const fileName = element.getAttribute("download") || 'file';
            const url = element.getAttribute("href") || '';
            const node = $createFileNode({ fileName, url });
            return { node };
          }
          return null;
        },
        priority: 0,
      }),
    };
  }

  override exportJSON(): SerializedFileNode {
    return {
      fileName: this.getFileName(),
      url: this.getUrl(),
      sizeBytes: this.__sizeBytes,
      type: "file",
      version: 1,
    };
  }

  static override importJSON(serializedNode: SerializedFileNode): FileNode {
    const { fileName, url, sizeBytes } = serializedNode;
    return $createFileNode({
      fileName,
      url,
      sizeBytes,
    });
  }

  getFileName(): string {
    return this.__fileName;
  }

  getUrl(): string {
    return this.__url;
  }

  override decorate(): JSX.Element {
    return (
      <FileComponent
        fileName={this.__fileName}
        url={this.__url}
        sizeBytes={this.__sizeBytes}
        nodeKey={this.getKey()}
      />
    );
  }
}

export function $createFileNode({
  fileName,
  url,
  sizeBytes,
  key,
}: FilePayload): FileNode {
  return new FileNode(fileName, url, sizeBytes, key);
}

export function $isFileNode(
  node: LexicalNode | null | undefined
): node is FileNode {
  return node instanceof FileNode;
}
