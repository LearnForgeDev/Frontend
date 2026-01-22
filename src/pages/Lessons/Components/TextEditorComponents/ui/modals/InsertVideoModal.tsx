import {Modal} from "../../../../../../CommonComponents/Modal.tsx";
import {useState} from "react";
import '../../../../../../styles/pages/Lessons/components/modals/insertVideoModal.css';
import {$getSelection, $insertNodes, $isRangeSelection, type LexicalEditor} from "lexical";
import {$createYouTubeNode} from "../../nodes/YoutubeNode.tsx";
import {$createRutubeNode} from "../../nodes/RutubeNode.tsx";
import {isRutubeUrl, isYoutubeUrl, parseRutubeId, parseYoutubeId} from "../../utils/url.ts";

export default function InsertVideoModal({onClose, editor}: {onClose: () => void, editor: LexicalEditor}) {
  const [videoUrl, setVideoUrl] = useState('');
  const [errorText, setErrorText] = useState('');

  const handleInsert = (url: string) => {
    setErrorText('');

    if (isYoutubeUrl(videoUrl)) {
      editor.update(() => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          setErrorText('Пожалуйста, выберите место для вставки видео');
          return;
        }

        const ytId = parseYoutubeId(url);
        if (!ytId) {
          setErrorText('Неверная ссылка на YouTube видео');
          return;
        }

        const ytNode = $createYouTubeNode(ytId);
        $insertNodes([ytNode]);
      })
    } else if (isRutubeUrl(videoUrl)) {
      editor.update(() => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          setErrorText('Пожалуйста, выберите место для вставки видео');
          return;
        }

        const rutubeId = parseRutubeId(url);
        if (!rutubeId) {
          setErrorText('Неверная ссылка на RuTube видео');
          return;
        }

        const rutubeNode = $createRutubeNode(rutubeId);
        $insertNodes([rutubeNode]);
      })
    } else {
      setErrorText('Данный формат видео не поддерживается');
      return;
    }
    onClose();
  }

  return (
    <Modal
      onClose={onClose}
      className={'insert-video-modal'}
    >
      <p className={'title'}>Вставить видео</p>
      <div className='src-input-group'>
        <input
          className={'link-text-input'}
          placeholder='https://'
          value={videoUrl}
          autoFocus={true}
          onChange={(e) => {
            setVideoUrl(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleInsert(videoUrl.trim());
          }}
        />
        <button
          onClick={() => handleInsert(videoUrl.trim())}
        >Вставить</button>
      </div>

      {errorText && <p className={'error-txt'}>{errorText}</p>}
    </Modal>
  );
}

