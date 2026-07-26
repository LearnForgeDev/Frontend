import { Modal } from '@/Assets/Components/Modal/Modal';
import React, {useState} from 'react';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$getSelection, $insertNodes, $isRangeSelection} from 'lexical';
import {$createFileNode} from '../../nodes/FileNode.tsx';
import { filesEndpoints } from '@/Endpoints';
import { useParams } from 'react-router-dom';
import { createDebugger, DebugSeverity } from '@/Assets/debugUtils';
const logger = createDebugger('InsertFileModal');

import './InsertImageModal.css';

export default function InsertFileModal({onClose}: {onClose: () => void}) {
  const [editor] = useLexicalComposerContext();
  const { schoolPublicId } = useParams<{ schoolPublicId: string }>();
  const [fileUrlError, setFileUrlError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleInsert = (url: string, fileName: string, sizeBytes?: number) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const fileNode = $createFileNode({ url, fileName, sizeBytes });
        $insertNodes([fileNode]);
      }
    });
    onClose();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleAddFile(e);
  };

  const handleAddFile = async (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    const file = 'dataTransfer' in e
      ? e.dataTransfer?.files[0]
      : e.target?.files?.[0];

    if (file) {
      if (!schoolPublicId) {
        setFileUrlError('Не удалось определить ID школы для загрузки');
        return;
      }
      setIsUploading(true);
      setFileUrlError('');
      try {
        const apiFile = await filesEndpoints.uploadFileMultipart(schoolPublicId, file, undefined, undefined, 'lessons');
        const url = filesEndpoints.getFileUrl(schoolPublicId, apiFile.publicId);
        handleInsert(url, file.name, file.size);
      } catch (error) {
        logger.logEventForDebug(DebugSeverity.DANGER, 'Failed to upload file', error);
        setFileUrlError('Ошибка при загрузке файла');
      } finally {
        setIsUploading(false);
      }
    }
  }

  return (
    <Modal
      onClose={onClose}
      className={'insert-image-modal'}
    >
      <p className={'title'}>Прикрепить файл</p>

      <div className={'content'}>
        { fileUrlError && <p className='error-txt'>{fileUrlError}</p> }

        <div
          className={`drag-and-drop-area ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            document.getElementById('fileInputAttach')?.click();
          }}
        >
          <input
            type='file'
            aria-hidden={true}
            style={{display: 'none'}}
            id='fileInputAttach'
            onChange={handleAddFile}
            onClick={(e) => e.stopPropagation()}
            disabled={isUploading}
          />
          <span>{isUploading ? 'Загрузка...' : 'Перетащите или нажмите'}</span >
        </div>
      </div>
    </Modal>
  );
}
