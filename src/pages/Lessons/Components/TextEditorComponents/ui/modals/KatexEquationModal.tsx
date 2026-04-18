/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {JSX} from 'react';

import './KatexEquationModal.css';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

import {useCallback, useState} from 'react';
import {ErrorBoundary} from 'react-error-boundary';

import KatexRenderer from '../KatexRenderer.tsx';
import {Modal} from "../../../../../../assets/CommonComponents/Modal.tsx";

type Props = {
  initialEquation?: string;
  onConfirm: (equation: string, inline: boolean) => void;
  onClose: () => void;
};

export default function KatexEquationModal({
                                               onConfirm,
                                               onClose,
                                               initialEquation = '',
                                             }: Props): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [equation, setEquation] = useState<string>(initialEquation);
  const [inline, setInline] = useState<boolean>(true);

  const onClick = useCallback(() => {
    onConfirm(equation, inline);
    onClose();
  }, [onConfirm, equation, inline, onClose]);

  const onCheckboxChange = useCallback(() => {
    setInline(!inline);
  }, [setInline, inline]);

  return (
    <Modal
      onClose={onClose}
      className={'equationModal'}
    >
      <h1>Вставить уравнение</h1>
      <div className="KatexEquationAlterer_defaultRow">
        Занимать всю строку?
        <input type="checkbox" checked={!inline} onChange={onCheckboxChange} />
      </div>
      <p>Уравнение </p>
      <div className="KatexEquationAlterer_centerRow">
        {inline ? (
          <input
            onChange={(event) => {
              setEquation(event.target.value);
            }}
            value={equation}
            className="KatexEquationAlterer_textArea"
          />
        ) : (
          <textarea
            onChange={(event) => {
              setEquation(event.target.value);
            }}
            value={equation}
            className="KatexEquationAlterer_textArea"
          />
        )}
      </div>
      <p>Визуализация</p>
      <div className="KatexEquationAlterer_centerRow previewBox">
        <ErrorBoundary onError={(e) => editor._onError(e)} fallback={null}>
          <KatexRenderer
            equation={equation}
            inline={false}
            onDoubleClick={() => null}
          />
        </ErrorBoundary>
      </div>
      <div className="KatexEquationAlterer_dialogActions">
        <button onClick={onClick}>Вставить</button>
      </div>
    </Modal>
  );
}