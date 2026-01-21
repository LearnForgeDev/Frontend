import type {PluginItem} from "../../../../types/lessonTypes.ts";
import {useEffect, useEffectEvent, useRef, useState} from "react";

export default function Dropdown({
  buttons,
  action,
  value
}: {
  buttons: Array<PluginItem>,
  action: (event: string) => void,
  value?: string,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(buttons[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const setSelectedElement = useEffectEvent((item: PluginItem) => setSelected(item));

  useEffect(() => {
    if (value) {
      const button = buttons.find(b => b.event === value);
      if (button) {
        setSelectedElement(button);
      }
    }
  }, [value, buttons]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (button: PluginItem) => {
    setSelected(button);
    action(button.event);
    setIsOpen(false);
  };

  return (
    <div className='toolbar-dropdown' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={selected.label}
        aria-expanded={isOpen}
        className='toolbar-button dropdown-trigger'
        title={selected.label}
      >
        <img src={selected.icon} alt={selected.label} />
        <span>{selected.label}</span><span className="dropdown-arrow">▼</span>
      </button>
      {isOpen && (
        <div className="dropdown-content">
          {buttons.map((button) => (
            <button
              key={button.event}
              onClick={() => handleSelect(button)}
              className={`dropdown-item ${selected.event === button.event ? 'selected' : ''}`}
              aria-label={button.label}
              title={button.label}
            >
              <img src={button.icon} alt="" />
              <span>{button.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
