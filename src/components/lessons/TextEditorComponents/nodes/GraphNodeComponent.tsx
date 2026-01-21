import {useEffect, useRef, useCallback} from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_DELETE_COMMAND,
  type NodeKey,
} from "lexical";
// @ts-expect-error fuck ts
import Desmos from "desmos";
import { $isGraphNode } from "./graphNode.tsx";
import "../../../../styles/pages/Lessons/components/nodes/graphNode.css";

interface GraphComponentProps {
  nodeKey: NodeKey;
}

export default function GraphComponent({
  nodeKey,
}: GraphComponentProps) {
  const [editor] = useLexicalComposerContext();
  const graphRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<Desmos>(null);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);

  const onDelete = useCallback(
    (event: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        event.preventDefault();
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if ($isGraphNode(node)) {
            node.remove();
          }
        });
      }
      return false;
    },
    [editor, isSelected, nodeKey]
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        (event) => {
          if (graphRef.current && graphRef.current.contains(event.target as Node)) {
            if (!event.shiftKey) {
              clearSelection();
            }
            setSelected(true);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW
      )
    );
  }, [clearSelection, editor, onDelete, setSelected]);

  useEffect(() => {
    if (graphRef.current && !calculatorRef.current) {
      calculatorRef.current = Desmos.GraphingCalculator(graphRef.current);
      calculatorRef.current.setExpression({ id: "graph1", latex: "y=x^2" });
    }

    return () => {
      if (calculatorRef.current) {
        calculatorRef.current.destroy();
        calculatorRef.current = null;
      }
    };
  }, []);


  return (
    <div
      ref={graphRef}
      className="calculator-desmos"
    />
  );
}