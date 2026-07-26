import { Box, Typography } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_DELETE_COMMAND,
  type NodeKey,
} from "lexical";
import { $isGraphNode } from './graphNode.tsx';
import { createDebugger, DebugSeverity } from '@/Assets/debugUtils';
const logger = createDebugger('GraphNodeComponent');

import './graphNode.css';

type DesmosCalculator = {
  destroy: () => void;
  setExpression: (expression: { id: string; latex: string }) => void;
};

type DesmosWindow = Window & {
  Desmos?: {
    GraphingCalculator: (element: HTMLElement) => DesmosCalculator;
  };
};

const DESMOS_SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/desmos@1.5.4/build/desmos.min.js';

let desmosScriptPromise: Promise<void> | null = null;

function loadDesmosScript(): Promise<void> {
  const desmosWindow = window as DesmosWindow;

  if (desmosWindow.Desmos) {
    return Promise.resolve();
  }

  if (!desmosScriptPromise) {
    desmosScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${DESMOS_SCRIPT_URL}"]`);

      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Desmos script')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.src = DESMOS_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Desmos script'));
      document.head.appendChild(script);
    });
  }

  return desmosScriptPromise;
}

interface GraphComponentProps {
  nodeKey: NodeKey;
}

export default function GraphComponent({
  nodeKey,
}: GraphComponentProps) {
  const [editor] = useLexicalComposerContext();
  const graphRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<DesmosCalculator | null>(null);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

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
    let isMounted = true;

    const initializeCalculator = async () => {
      try {
        await loadDesmosScript();

        if (!isMounted || !graphRef.current) {
          return;
        }

        const desmosWindow = window as DesmosWindow;
        if (!desmosWindow.Desmos) {
          if (isMounted) {
            setStatus('error');
          }
          return;
        }

        calculatorRef.current = desmosWindow.Desmos.GraphingCalculator(graphRef.current);
        calculatorRef.current.setExpression({ id: 'graph1', latex: 'y=x^2' });
        setStatus('ready');
      } catch (error) {
        if (isMounted) {
          setStatus('error');
        }

        logger.logEventForDebug(DebugSeverity.DANGER, 'Log:', error);
      }
    };

    void initializeCalculator();

    if (graphRef.current && !calculatorRef.current) {
      // Initialization now happens asynchronously via the loader above.
    }

    return () => {
      isMounted = false;

      if (calculatorRef.current) {
        calculatorRef.current.destroy();
        calculatorRef.current = null;
      }
    };
  }, []);


  return (
    <Box
      ref={graphRef}
      className="calculator-desmos"
      role="group"
      aria-label="Графический калькулятор"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        minHeight: 240,
        overflow: 'hidden',
      }}
    >
      {status === 'loading' && (
        <Typography color="text.secondary">Загрузка графика…</Typography>
      )}
      {status === 'error' && (
        <Typography color="error">Не удалось загрузить графический калькулятор.</Typography>
      )}
    </Box>
  );
}