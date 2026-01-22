import {
  DecoratorNode,
  type DOMConversionMap,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
  createCommand,
  type LexicalCommand,
} from "lexical";
import type { JSX } from "react";
import ImageComponent from "./ImageComponent.tsx";

export interface ImagePayload {
  altText: string;
  src: string;
  width?: number;
  height?: number;
  float?: 'left' | 'right' | 'center';
  key?: NodeKey;
}

export type SerializedImageNode = Spread<
  {
    altText: string;
    src: string;
    width?: number;
    height?: number;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __altText: string;
  __width?: number;
  __height?: number;
  __float?: "left" | "right" | "center";

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__float,
      node.__key
    );
  }

  constructor(
    src: string,
    altText: string,
    width?: number,
    height?: number,
    float?: 'left' | 'right' | 'center',
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__height = height;
    this.__float = float;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement("span");
    const className = config.theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): false {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("img");
    element.setAttribute("src", this.__src);
    element.setAttribute("alt", this.__altText);
    if (this.__width !== undefined) {
      element.setAttribute("width", String(this.__width));
    }
    if (this.__height !== undefined) {
      element.setAttribute("height", String(this.__height));
    }
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: (element: HTMLElement) => {
          if (element instanceof HTMLImageElement) {
            const { alt: altText, src, width, height } = element;
            const node = $createImageNode({
              altText,
              src,
              width: width ? Number(width) : undefined,
              height: height ? Number(height) : undefined,
            });
            return { node };
          }
          return null;
        },
        priority: 0,
      }),
    };
  }

  exportJSON(): SerializedImageNode {
    return {
      altText: this.getAltText(),
      src: this.getSrc(),
      width: this.__width,
      height: this.__height,
      type: "image",
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { altText, src, width, height } = serializedNode;
    return $createImageNode({
      altText,
      src,
      width,
      height,
    });
  }

  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }

  getWidth(): number | undefined {
    return this.__width;
  }

  setWidth(width: number | undefined): void {
    const writable = this.getWritable();
    writable.__width = width;
  }

  getHeight(): number | undefined {
    return this.__height;
  }

  setHeight(height: number | undefined): void {
    const writable = this.getWritable();
    writable.__height = height;
  }

  decorate(): JSX.Element {
    return (
      <ImageComponent
        float={this.__float}
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        height={this.__height}
        nodeKey={this.getKey()}
      />
    );
  }
}


// eslint-disable-next-line react-refresh/only-export-components
export function $createImageNode({
  altText,
  src,
  width,
  height,
  float,
  key,
}: ImagePayload): ImageNode {
  return new ImageNode(src, altText, width, height, float, key);
}

// eslint-disable-next-line react-refresh/only-export-components
export function $isImageNode(
  node: LexicalNode | null | undefined
): node is ImageNode {
  return node instanceof ImageNode;
}

export interface ResizeImagePayload {
  nodeKey: NodeKey;
  width: number | undefined;
  height: number | undefined;
}

export const RESIZE_IMAGE_COMMAND: LexicalCommand<ResizeImagePayload> =
  createCommand("RESIZE_IMAGE_COMMAND");
