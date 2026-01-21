import { useCallback, useRef, useLayoutEffect, useState, useEffect } from 'react'

type ModifierKey = 'Control' | 'Alt' | 'Command' | 'Shift'

interface ShortcutOptions {
  disableTextInputs?: boolean
}

export const useShortcut = (
  shortcut: string,
  callback: (event: KeyboardEvent) => void,
  options: ShortcutOptions = { disableTextInputs: true }
) => {
  const callbackRef = useRef(callback)
  const [keyCombo, setKeyCombo] = useState<string[]>([])

  useLayoutEffect(() => {
    callbackRef.current = callback
  })

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isTextInput =
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLInputElement &&
          (!event.target.type || event.target.type === 'text')) ||
        (event.target as HTMLElement)?.isContentEditable

      const modifierMap: Record<ModifierKey, boolean> = {
        'Control': event.ctrlKey,
        'Alt': event.altKey,
        'Command': event.metaKey,
        'Shift': event.shiftKey,
      }

      // Cancel shortcut if key is being held down
      if (event.repeat) {
        return
      }

      // Don't enable shortcuts in inputs unless explicitly declared
      if (options.disableTextInputs && isTextInput) {
        event.stopPropagation()
        return
      }

      // Handle combined modifier key shortcuts (e.g. pressing Control + D)
      if (shortcut.includes('+')) {
        const keyArray = shortcut.split('+')

        // If the first key is a modifier, handle combinations
        if (Object.keys(modifierMap).includes(keyArray[0])) {
          const finalKey = keyArray.pop()

          // Run handler if the modifier(s) + key have both been pressed
          if (keyArray.every((k) => modifierMap[k as ModifierKey]) && finalKey === event.key) {
            return callbackRef.current(event)
          }
        } else {
          // If the shortcut doesn't begin with a modifier, it's a sequence
          if (keyArray[keyCombo.length] === event.key) {
            // Handle final key in the sequence
            if (
              keyArray[keyArray.length - 1] === event.key &&
              keyCombo.length === keyArray.length - 1
            ) {
              // Run handler if the sequence is complete, then reset it
              callbackRef.current(event)
              setKeyCombo([])
              return
            }

            // Add to the sequence
            setKeyCombo((prevCombo) => [...prevCombo, event.key])
            return
          }
          if (keyCombo.length > 0) {
            // Reset key combo if it doesn't match the sequence
            setKeyCombo([])
            return
          }
        }
      }

      // Single key shortcuts (e.g. pressing D)
      if (shortcut === event.key) {
        return callbackRef.current(event)
      }
    },
    [shortcut, keyCombo.length, options.disableTextInputs]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])
}