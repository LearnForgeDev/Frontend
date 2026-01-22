import {Modal} from "../../../../../../CommonComponents/Modal.tsx";
import React, {useState} from "react";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {$getSelection, $insertNodes, $isRangeSelection} from "lexical";
import {$createImageNode} from "../../nodes/ImageNode.tsx";
import '../../../../../../styles/pages/Lessons/components/modals/insertImageModal.css';

export default function InsertImageModal({onClose}: {onClose: () => void}) {
  const [editor] = useLexicalComposerContext();
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrlError, setImageUrlError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

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

  const handleAddImg = (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    const file = 'dataTransfer' in e
      ? e.dataTransfer?.files[0]
      : e.target?.files?.[0];

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        handleInsert(src, file.name);
      };
      reader.readAsDataURL(file);
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
          />
          <span>Перетащите или нажмите</span >
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