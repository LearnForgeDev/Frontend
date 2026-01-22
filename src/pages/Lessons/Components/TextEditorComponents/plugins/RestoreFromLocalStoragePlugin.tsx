import { useLocalStorage } from 'react-use'
import OnChangePlugin from '@lexical/react/LexicalOnChangePlugin'
import React, {type JSX} from "react";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import type {EditorState} from "lexical";


export default function RestoreFromLocalStoragePlugin({id}: {id?: string}): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const [serializedEditorState, setSerializedEditorState] = useLocalStorage<
    string | null
  >(`lesson-${id}-editor`, null) // TODO: define better key
  const [isFirstRender, setIsFirstRender] = React.useState(true)

  React.useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false)

      if (serializedEditorState) {
        const initialEditorState = editor.parseEditorState(serializedEditorState)
        editor.setEditorState(initialEditorState)
      }
    }
  }, [isFirstRender, serializedEditorState, editor])

  const onChange = React.useCallback(
    (editorState: EditorState) => {
      setSerializedEditorState(JSON.stringify(editorState.toJSON()))
    },
    [setSerializedEditorState]
  )

  // @ts-expect-error stolen code, must work
  return <OnChangePlugin onChange={onChange} />
}