import React, {useCallback, useEffect, type JSX} from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  type NodeKey,
} from "lexical";
import { $isFileNode } from './FileNode.tsx';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';
import './fileNode.css';

interface FileComponentProps {
  fileName: string;
  url: string;
  sizeBytes?: number;
  nodeKey: NodeKey;
}

export default function FileComponent({
  fileName,
  url,
  sizeBytes,
  nodeKey,
}: FileComponentProps): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const onDelete = useCallback(
    (event: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        event.preventDefault();
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if ($isFileNode(node)) {
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
          if (containerRef.current && containerRef.current.contains(event.target as Node)) {
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
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW
      )
    );
  }, [clearSelection, editor, onDelete, setSelected]);

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  return (
    <div
      ref={containerRef}
      className={`file-node-wrapper ${isSelected ? "selected" : ""}`}
      contentEditable={false}
    >
      <div className="file-node-content">
        <InsertDriveFileIcon className="file-icon" />
        <div className="file-details">
          <span className="file-name">{fileName}</span>
          {sizeBytes && <span className="file-size">{formatSize(sizeBytes)}</span>}
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer" className="download-btn" download={fileName}>
          <DownloadIcon />
        </a>
      </div>
    </div>
  );
}
