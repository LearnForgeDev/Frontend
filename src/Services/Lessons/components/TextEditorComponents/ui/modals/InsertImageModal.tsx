import { Modal } from '@/Assets/Components/Modal/Modal';
import React, {useState} from 'react';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$getSelection, $insertNodes, $isRangeSelection} from 'lexical';
import {$createImageNode} from '../../nodes/ImageNode.tsx';
import { useGlobalContext } from '@/Storage/Context/useGlobalContext';
import { filesEndpoints } from '@/Endpoints/files.endpoints';
import './InsertImageModal.css';

export default function InsertImageModal({onClose}: {onClose: () => void}) {
  const [editor] = useLexicalComposerContext();
  const schoolId = useGlobalContext((s) => s.auth.user?.activeSchoolId);
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrlError, setImageUrlError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleInsert = async (src?: string, altText: string = "Image") => {
    const imageSource = src;
    if (!imageSource) return;

    if (!imageSource.startsWith('data:image/')) {
      const isValid = await isValidImgUrl(imageSource);
      if (!isValid) {
        setImageUrlError('Неверный URL изображения');
        return;
      }
    }

    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const imageNode = $createImageNode({ src: imageSource, altText });
        $insertNodes([imageNode]);
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
    handleAddImg(e);
  };

  const handleAddImg = async (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    const file = 'dataTransfer' in e
      ? e.dataTransfer?.files[0]
      : e.target?.files?.[0];

    if (file && file.type.startsWith('image/')) {
      if (!schoolId) {
        setImageUrlError('Не удалось определить ID школы для загрузки');
        return;
      }
      setIsUploading(true);
      setImageUrlError('');
      try {
        const apiFile = await filesEndpoints.uploadFileMultipart(schoolId, file);
        const url = filesEndpoints.getFileUrl(schoolId, apiFile.publicId);
        handleInsert(url, file.name);
      } catch (error) {
        console.error('Failed to upload image', error);
        setImageUrlError('Ошибка при загрузке изображения');
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
      <p className={'title'}>Вставить изображение</p>

      <div className={'content'}>
        <div className='src-input-group'>
          <input
            className={'link-text-input'}
            placeholder='https://'
            value={imageUrl}
            autoFocus={true}
            onChange={(e) => {
              setImageUrl(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInsert(imageUrl.trim());
            }}
          />
          <button
            onClick={() => handleInsert(imageUrl.trim())}
          >Вставить</button>
        </div>

        { imageUrlError && <p className='error-txt'>{imageUrlError}</p> }

        <p className='or-txt'>или</p>

        <div
          className={`drag-and-drop-area ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            document.getElementById('fileInput')?.click();
          }}
        >
          <input
            type='file'
            accept='image/*'
            aria-hidden={true}
            style={{display: 'none'}}
            id='fileInput'
            onChange={handleAddImg}
            onClick={(e) => e.stopPropagation()}
            disabled={isUploading}
          />
          <span>{isUploading ? 'Загрузка...' : 'Перетащите или нажмите'}</span >
        </div>
      </div>
    </Modal>
  );
}

function isValidImgUrl(url: string): Promise<boolean> {
  const img = new Image();
  img.src = url;
  return new Promise((resolve) => {
    img.onerror = () => resolve(false);
    img.onload = () => resolve(true);
  });
}