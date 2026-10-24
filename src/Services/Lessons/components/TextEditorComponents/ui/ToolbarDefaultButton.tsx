import type {PluginItem} from '@/Services/Lessons/lessonTypes';

export default function DefaultButton({
  button,
  action,
  active = false,
  disabled = false
}: {
  button: PluginItem,
  action: (event: string) => void,
  active?: boolean,
  disabled?: boolean
}) {
  return (
    <button
      data-testid={`editor-${button.event}`}
      onClick={() => action(button.event)}
      aria-label={button.label}
      title={button.label}
      className={`toolbar-button ${active ? 'active' : ''}`}
      disabled={disabled}
    >
      <img src={button.icon} alt={button.label} />
    </button>
  )
}